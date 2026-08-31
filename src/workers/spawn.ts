import spawn from 'cross-spawn-cb';

// 0.x delegation child: node-version-call-local runs this in a newer local
// node, where npm can install modern packages (the proven 1.6.5 mechanism).
export default function spawnRemote(command: string, args: string[], options: { cwd: string }, callback: (err: Error | null) => void): void {
  spawn(command, args, options, (err) => callback(err ?? null));
}
