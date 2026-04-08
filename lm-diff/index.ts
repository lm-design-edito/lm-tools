import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';

const repoRoot = await simpleGit().revparse(['--show-toplevel']);
const git = simpleGit({
  baseDir: repoRoot
});

const syntax = {
  colors: {
    red: '\x1b[31m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    orange: '\x1b[33m',
    purple: '\x1b[35m',
  },
  bold: '\x1b[1m',
  reset: '\x1b[0m',
}

function log(type: 'main' | 'info' | 'error' | 'warning' | 'success' | 'default', message: string) {
  switch(type) {
    case 'main':
      console.log(`${syntax.bold}${syntax.colors.blue}`, message, syntax.reset);
      break;
    case 'info':
      console.log(`${syntax.reset}${syntax.colors.blue}`, message, syntax.reset);
      break;
    case 'error':
      console.error(`${syntax.bold}${syntax.colors.red}`, message, syntax.reset);
      break;
    case 'warning':
      console.warn(`${syntax.reset}${syntax.colors.orange}`, message, syntax.reset);
      break;
    case 'success':
      console.log(`${syntax.bold}${syntax.colors.green}`, message, syntax.reset);
      break;
    default:
      console.log(`${syntax.reset}${syntax.colors.purple}`, message, syntax.reset);
      break;
  }
}

export type Diff = Record<string, {
  then: string,
  now: string
}>

export type GetDiffOptions = {
  cwd?: string,
  fullHistory?: boolean
}

const getOutputFile = (commitHash: string, { cwd, fullHistory }: GetDiffOptions) => {
  return `lm-diff-output-${commitHash}${cwd ? '-' + cwd.replace(/\//g, '_') : ''}${fullHistory ? '-fullHistory' : ''}.json`;
}

const getNormalizedRepoDirectory = (cwd: string) => {
  // File is in the repo if it's in the current working directory or a subdirectory of it
  const repoDirectory = path.relative(process.cwd(), path.resolve(process.cwd(), cwd));
  return repoDirectory.replace(/\\/g, '/').replace(/\/+$/, '') + '/';
}

const getFilePathInRepo = (file: string) => {
  return path.resolve(repoRoot, file);
}

type FileDiff = {
  hash: string
}
export async function getDiffFrom (
  commitHash: string,
  options: GetDiffOptions = {}
): Promise<Diff> {
  const { cwd, fullHistory } = options

  log('info', `-Lancement de getDiffFrom`);

  const changedFiles = new Map<string, FileDiff>();

  // If full history, first retrieved changedFiles from all commits (full history)
  if (fullHistory) {
    log('info', `-Récupération de tous les commits depuis #${commitHash}...`);
    const allLogs = await git.log({ from: commitHash, to: 'HEAD' });
    log('info', `-Nombre de commits récupérés : ${allLogs.total}`);

    for (const logEntry of allLogs.all) {
      const diffNameStatus = await git.raw(['diff-tree', '--no-commit-id', '--name-status', '-r', logEntry.hash]);
      diffNameStatus.split('\n').map(line => line.trim().split('\t')[1]).filter(Boolean).forEach((filePath) => {
        changedFiles.set(filePath, {
          hash: logEntry.hash
        });
      })
    }
  }

  log('info', `-Récupération de tous les fichiers modifiés mais pas encore trackés par l'historique git`);
  const status = await git.status();
  [
    ...status.modified,
    ...status.created,
    ...status.deleted,
    ...status.renamed.map(r => r.to),
    ...status.not_added
  ].forEach(file => {
    changedFiles.set(file, {
      hash: ''
    });
  })

  const filteredChangedFiles = Array.from(changedFiles).filter((changedFile) => {
    if (cwd) {
      return changedFile[0].startsWith(getNormalizedRepoDirectory(cwd));
    }
    return true;
  });

  log('info', `-${filteredChangedFiles.length > 0 ? filteredChangedFiles.length : 'Aucun fichier modifié'} fichiers modifiés depuis le commit #${commitHash}}`);
  
  const result: Diff = {};
  for (const [filePath, fileDiff] of filteredChangedFiles) {
    const diff = { then: '', now: '' };
    try {
      diff.then = await git.show([`${commitHash}:${filePath}`]);
      log('info', `----- ${filePath} - ${fileDiff.hash ? `#${fileDiff.hash}` : 'non commité'}`);
    } catch(err) {
      log('warning', `----- ${filePath} - Fichier tout juste potentiellement crée ou modifié.`);
      diff.then = '';
    }
    try {
      diff.now = fs.readFileSync(getFilePathInRepo(filePath), 'utf8');
    } catch(err) {
      log('warning', `----- ${filePath} - Fichier potentiellement supprimé.`);
    }
    result[filePath] =  diff;
  }
  log('success', `Diff complet généré pour ${filteredChangedFiles.length} fichiers.`);
  
  return result;
}

const ARGS = {
  FULL_HISTORY: ['-full-history', '--full-history', '-f-h', '--f-h'],
  CWD: ['-cwd=', '--cwd=']
}
function parseArgs(argv: string[]) {
  const args: { commitHash?: string, cwd?: string, fullHistory?: boolean } = { };
  for (const arg of argv) {
    if (/^[a-fA-F0-9]{7,40}$/.test(arg) && !args.commitHash) {
      args.commitHash = arg;
    } else if (arg.includes(ARGS.CWD[0])) {
      args.cwd = arg.replace(ARGS.CWD[1], '').replace(ARGS.CWD[0], '');
    } else if (ARGS.FULL_HISTORY.includes(arg)) {
      args.fullHistory = true;
    }
  }
  return args;
}

// Check if the script is run directly (e.g., node dist/index.js ...) and not imported as a module
if (import.meta.url === `file://${process.argv[1]}`) {
  log('main', '===== LM Diff =====');

  const { commitHash, cwd, fullHistory } = parseArgs(process.argv);

  log('default', `Helper: npm run lm-diff -- <commitHash> [--cwd=path/to/dir] [--full-history]`);

  // Check if commitHash is a valid git hash (7 to 40 hexadecimal characters)
  const isValidHash = typeof commitHash === 'string' && /^[a-fA-F0-9]{7,40}$/.test(commitHash);
  if (!isValidHash) {
    log('error', 'Erreur : le commitHash semble invalide. Il doit être une chaîne de 7 à 40 caractères hexadécimaux.');
    process.exit(1);
  }

  const isValidCwd = typeof cwd === 'undefined' || (typeof cwd === 'string' && /^(\.{1,2}\/?|\/|[a-zA-Z0-9_\-\.\/]+)$/.test(cwd));
  if (!isValidCwd) {
    log('error', 'Erreur : cwd ne ressemble pas à un chemin de dossier valide. Laisser vide pour que le script s\'execute dans le dossier courrant.');
    process.exit(1);
  }

  log('info', `Options : commitHash=${commitHash}, cwd=${cwd}, fullHistory=${fullHistory}`);

  const diffOptions = {
    cwd,
    fullHistory
  }
  const diff = await getDiffFrom(commitHash, diffOptions);
  // TODO : passer fullHistory à getDiffFrom et gérer la logique avancée
  // Écriture du résultat dans un fichier JSON
  const outputFile = getOutputFile(commitHash, diffOptions);
  try {
    fs.writeFileSync(outputFile, JSON.stringify(diff, null, 2), 'utf8');
    log('success', `Diff sauvegardé dans ${outputFile}`);
  } catch (err) {
    log('error', `Erreur lors de l'écriture du fichier de sortie : ${err}`);
  }
  log('main', '===== LM Diff =====');
} 
