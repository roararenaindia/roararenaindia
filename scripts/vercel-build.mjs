import { spawn } from 'node:child_process'

const child = spawn(process.platform === 'win32' ? 'next.cmd' : 'next', ['build'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
})

child.on('exit', (code) => {
  process.exit(code ?? 1)
})
