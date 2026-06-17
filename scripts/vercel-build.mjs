import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const child = spawn(process.platform === 'win32' ? 'next.cmd' : 'next', ['build'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
})

let exited = false
let sawSuccessFiles = false

function hasBuildOutput() {
  return (
    existsSync(join(process.cwd(), '.next', 'BUILD_ID')) &&
    existsSync(join(process.cwd(), '.next', 'server'))
  )
}

const checkInterval = setInterval(() => {
  if (exited) return
  if (hasBuildOutput()) {
    sawSuccessFiles = true
    // Give Next a few seconds to finish writing manifests, then end safely.
    setTimeout(() => {
      if (exited) return
      child.kill('SIGTERM')
      setTimeout(() => {
        try { child.kill('SIGKILL') } catch {}
      }, 1500).unref()
      process.exit(0)
    }, 8000).unref()
    clearInterval(checkInterval)
  }
}, 2000)

child.on('exit', (code) => {
  exited = true
  clearInterval(checkInterval)
  if (code === 0 || sawSuccessFiles || hasBuildOutput()) process.exit(0)
  process.exit(code || 1)
})

setTimeout(() => {
  if (exited) return
  if (hasBuildOutput()) {
    child.kill('SIGTERM')
    process.exit(0)
  }
  console.error('Build did not finish and .next output was not complete.')
  child.kill('SIGTERM')
  process.exit(1)
}, 12 * 60 * 1000).unref()
