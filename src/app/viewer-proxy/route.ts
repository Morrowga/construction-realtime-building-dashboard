// src/app/viewer-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

/**
 * Fetches the backend viewer page and injects a script that fills the config
 * form (token, project id, model keys) and auto-starts the viewer, so the
 * iframe shows the 3D model without manual configuration.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const token = params.get('token') ?? ''
  const projectId = params.get('pid') ?? ''
  const skeletonKey = params.get('skel') ?? ''
  const finishedKey = params.get('fin') ?? ''

  let html: string
  try {
    const res = await fetch(`${API_BASE}/viewer`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`viewer fetch failed: ${res.status}`)
    html = await res.text()
  } catch {
    return new NextResponse(
      '<html><body style="background:#0d1117;color:#8b949e;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh"><p>3Dビューアーに接続できません。バックエンド（' +
        API_BASE +
        '）が起動しているか確認してください。</p></body></html>',
      { status: 502, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  const esc = (v: string) => v.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/</g, '\\x3c')
  const inject = `
<script>
window.addEventListener('load', () => {
  document.getElementById('c-token').value = '${esc(token)}';
  document.getElementById('c-pid').value = '${esc(projectId)}';
  document.getElementById('c-skel').value = '${esc(skeletonKey)}';
  document.getElementById('c-fin').value = '${esc(finishedKey)}';
  setTimeout(() => startViewer(), 100);
});
</script>`

  const modified = html.includes('</body>')
    ? html.replace('</body>', `${inject}</body>`)
    : html + inject

  return new NextResponse(modified, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
