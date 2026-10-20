// Shared, dependency-free source-code invitation. The original QR image is never redrawn.
const cardImage = new URL('./xiaohongshu-card.jpg', import.meta.url).href;
const xianyuImage = new URL('./xianyu-card.jpg', import.meta.url).href;
const profileId = '384338020';
const icon = (name) => {
  const paths = {
    gift: '<rect x="3" y="8" width="18" height="4" rx="1.5"/><path d="M5 12v8h14v-8M12 8v12M12 8H8.5a2.5 2.5 0 1 1 2.45-3L12 8Zm0 0h3.5a2.5 2.5 0 1 0-2.45-3L12 8Z"/>',
    arrow: '<path d="M6 18 18 6M6 6h12v12"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
    chevron: '<path d="m8 10 4 4 4-4"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
};

class SourceAccess extends HTMLElement {
  connectedCallback() {
    if (this._abort && !this._abort.signal.aborted) return;
    if (!this.shadowRoot) this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = `
      <style>
        :host{--sa-ink:#292c27;--sa-paper:#fffefb;--sa-soft:#f4f2ed;--sa-line:#e9e7df;--sa-muted:#73766d;--sa-button:#303d34;--sa-button-ink:#fffefb;--sa-red:#df4550;display:inline-block;position:relative;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;line-height:1.5;text-align:left;color:var(--sa-ink)}
        :host([theme="dark"]){--sa-ink:#eeeee5;--sa-paper:#232722;--sa-soft:#2d332c;--sa-line:#3d443b;--sa-muted:#b0b6a9;--sa-button:#dfe8d6;--sa-button-ink:#242c23}
        *{box-sizing:border-box}button,a{-webkit-tap-highlight-color:transparent}button{font:inherit;cursor:pointer}svg{display:block;width:20px;height:20px;flex-shrink:0}button:focus-visible,a:focus-visible{outline:2px solid var(--sa-muted);outline-offset:4px}
        .trigger{display:flex;align-items:center;gap:9px;height:42px;padding:0 15px;border:1px solid var(--sa-line);background:var(--sa-paper);color:var(--sa-ink);border-radius:100px;font-size:13px;white-space:nowrap;box-shadow:0 2px 3px #141b1403;transition:background .18s,box-shadow .18s}
        .trigger:hover,.trigger[aria-expanded="true"]{background:var(--sa-soft);box-shadow:0 3px 10px #141b1408}.trigger .chevron,.trigger .chevron svg{width:14px;height:14px;transition:transform .2s}.trigger[aria-expanded="true"] .chevron{transform:rotate(180deg)}
        .panel{position:fixed;z-index:10000;top:var(--sa-top,76px);right:var(--sa-right,24px);width:286px;max-width:calc(100vw - 32px);max-height:calc(100dvh - var(--sa-top,76px) - 16px);overflow:auto;overscroll-behavior:contain;background:var(--sa-paper);border:1px solid var(--sa-line);border-radius:18px;box-shadow:0 18px 48px #17221818,0 4px 14px #17221808;padding:18px;animation:arrive .18s ease-out}
        .panel[hidden]{display:none}.top{display:flex;align-items:center;justify-content:space-between;gap:12px}.eyebrow{display:flex;align-items:center;gap:7px;font-size:9px;letter-spacing:1px;color:var(--sa-muted)}.dot{width:5px;height:5px;background:#8c9b7d;border-radius:50%}.close{width:28px;height:28px;display:grid;place-items:center;border:0;background:transparent;color:var(--sa-muted);border-radius:50%;margin:-6px -7px -6px 0}.close:hover{background:var(--sa-soft)}.close svg{width:16px;height:16px}
        h2{font-family:"Songti SC","Noto Serif CJK SC","STSong",serif;font-size:20px;font-weight:500;letter-spacing:-.6px;line-height:1.45;margin:12px 0 6px}p{margin:0}.intro{color:var(--sa-muted);font-size:11px;line-height:1.7}.qr-block{padding:11px 0 12px;text-align:center}.qr{width:160px;height:160px;margin:0 auto 7px;border:1px solid #eeece6;border-radius:13px;overflow:hidden;background:#fff}.qr svg{width:100%;height:100%}.qr-caption{font-size:10px;color:var(--sa-muted);letter-spacing:.3px}.qr-caption span{display:inline-block;background:#fff0f1;color:#bd3e48;border-radius:5px;padding:1px 5px;margin-right:5px;font-weight:600}
        .identity{border-top:1px solid var(--sa-line);padding-top:12px;display:flex;align-items:center;gap:9px}.avatar{width:32px;height:32px;flex-shrink:0;border-radius:50%;overflow:hidden;background:var(--sa-soft)}.avatar svg{width:100%;height:100%}.name{font-size:12px;font-weight:600}.handle{font-size:10px;color:var(--sa-muted);margin-top:2px;letter-spacing:.2px}.bio{margin:9px 0 12px;font-size:11px;color:var(--sa-muted);line-height:1.7}
        .actions{display:flex;gap:8px}.open-profile{flex:1;display:flex;align-items:center;justify-content:space-between;gap:9px;text-decoration:none;border:1px solid transparent;border-radius:9px;padding:8px 10px;font-size:11px;background:var(--sa-button);color:var(--sa-button-ink)}.open-profile svg{width:16px;height:16px}.copy{height:36px;width:36px;display:grid;place-items:center;background:var(--sa-soft);color:var(--sa-ink);border:1px solid var(--sa-line);border-radius:9px}.copy svg{width:16px;height:16px}.feedback{font-size:10px;color:var(--sa-muted);margin-top:7px}.feedback:empty{display:none}
        .panel{width:368px;padding:20px;border-radius:20px}.top{align-items:flex-start}.eyebrow{font-size:9px;letter-spacing:1.5px}h2{font-family:inherit;font-size:19px;font-weight:650;letter-spacing:-.7px;margin:9px 0 5px}.intro{font-size:11px;line-height:1.7}.channels{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0}.channel{min-width:0;background:var(--sa-soft);border:1px solid var(--sa-line);border-radius:13px;padding:11px 9px 9px;text-align:center}.channel-head{display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:9px;font-size:9px;color:var(--sa-muted)}.badge{font-size:11px;font-weight:650;padding:2px 6px;border-radius:5px;background:#ffeaed;color:#c53648}.xianyu .badge{background:#ffe944;color:#403a12}.qr{width:100%;height:auto;aspect-ratio:1;margin:0 0 7px;border:1px solid #eeece6;border-radius:8px}.channel-detail{font-size:9px;color:var(--sa-muted);white-space:nowrap;letter-spacing:-.1px}.channel-action{margin-top:9px;min-height:30px;display:flex;align-items:center;justify-content:center;gap:5px;font-size:10px;text-decoration:none;border-radius:7px;background:var(--sa-paper);border:1px solid var(--sa-line);color:var(--sa-ink);width:100%;padding:5px}.channel-action svg{width:12px;height:12px}.identity{padding-top:13px;gap:9px}.name{font-size:12px}.bio{margin:2px 0 0;font-size:10px;line-height:1.5}.avatar{width:34px;height:34px}.copy{margin-left:auto;width:30px;height:30px;border-radius:7px;background:transparent}.copy svg{width:14px;height:14px}.footer-note{font-size:9px;color:var(--sa-muted);text-align:center;margin-top:12px}.footer-note:before{content:'✦';margin-right:5px;color:#92a183}@media(max-width:420px){.panel{padding:17px;width:358px}.channels{gap:8px;margin:14px 0}.channel{padding:10px 8px 8px}h2{font-size:18px}.channel-head{font-size:8px}.channel-detail{font-size:9px}.intro{font-size:10px}}
        @keyframes arrive{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}@media(max-width:420px){.trigger{height:38px;padding:0 12px;font-size:12px}.trigger>svg:first-child{width:17px;height:17px}.panel{padding:18px}.qr{width:160px;height:160px}}
      @media(max-width:420px){.panel{padding:17px}.qr{width:100%;height:auto;aspect-ratio:1}}.top{align-items:center;margin-bottom:5px}.top h2{margin:0;font-size:18px}.channels{margin:13px 0}.channel-head{margin-bottom:7px}.footer-note{margin-top:10px}@media(max-width:350px){.trigger{gap:0;padding:0 10px}.trigger>svg,.trigger>.chevron{display:none}}</style>
      <button class="trigger" type="button" aria-expanded="false" aria-controls="source-access-panel" aria-label="免费获取源码，查看小红书和闲鱼二维码">${icon('gift')}<span>免费获取源码</span><span class="chevron">${icon('chevron')}</span></button>
      <section class="panel" id="source-access-panel" aria-labelledby="source-access-title" hidden>
        <div class="top"><h2 id="source-access-title">把灵感，带回你的项目。</h2><button class="close" type="button" aria-label="关闭源码卡片">${icon('close')}</button></div>
        <p class="intro">源码免费分享，开发与 AI 合作也欢迎私信。</p>
        <div class="channels">
          <div class="channel xhs">
            <div class="channel-head"><span class="badge">小红书</span><span>作品 · 源码</span></div>
            <div class="qr qr-xhs"><svg viewBox="650 1010 280 280" role="img" aria-label="数码暴龙AI的小红书二维码"><image href="${cardImage}" width="987" height="1347"/></svg></div>
            <p class="channel-detail">小红书号 · ${profileId}</p>
            <a class="channel-action open-profile" target="_blank" rel="noopener noreferrer">去主页看看 ${icon('arrow')}</a>
          </div>
          <div class="channel xianyu">
            <div class="channel-head"><span class="badge">闲鱼</span><span>小店 · 服务</span></div>
            <div class="qr qr-xianyu"><svg viewBox="157 1507 214 214" role="img" aria-label="数码暴龙AI的闲鱼二维码"><image href="${xianyuImage}" width="1216" height="2291"/></svg></div>
            <p class="channel-detail">数码暴龙AI</p>
            <a class="channel-action" href="${xianyuImage}" download="数码暴龙AI-闲鱼名片.jpg">保存闲鱼名片 ${icon('arrow')}</a>
          </div>
        </div>
        <div class="identity"><div class="avatar"><svg viewBox="83 267 253 253" role="img" aria-label="数码暴龙AI头像"><image href="${cardImage}" width="987" height="1347"/></svg></div><div><p class="name">数码暴龙AI</p><p class="bio">大厂程序员 · 独立开发者</p></div><button class="copy" type="button" aria-label="复制小红书号 ${profileId}" title="复制小红书号">${icon('copy')}</button></div>
        <p class="footer-note">用对应 App 扫码，或保存名片后识别</p>
        <p class="feedback" role="status" aria-live="polite"></p>
      </section>`;
    this.trigger = this.shadowRoot.querySelector('.trigger');
    this.panel = this.shadowRoot.querySelector('.panel');
    this.profileLink = this.shadowRoot.querySelector('.open-profile');
    this.profileLink.href = 'https://www.xiaohongshu.com/user/profile/556b22b967bc65522ef3fc8a';
    this._abort = new AbortController();
    const listen = (target, event, callback, options = {}) => target.addEventListener(event, callback, {...options, signal: this._abort.signal});
    listen(this.trigger, 'click', () => this.panel.hidden ? this.show() : this.hide());
    listen(this, 'pointerenter', event => { if (event.pointerType === 'mouse') this.show(); });
    listen(this, 'pointerleave', event => { if (event.pointerType === 'mouse') this._closeTimer = setTimeout(() => { if (document.activeElement !== this) this.hide(); }, 180); });
    listen(this.panel, 'pointerenter', () => clearTimeout(this._closeTimer));
    listen(this.shadowRoot, 'focusin', event => { if (!this._ignoreFocus && event.composedPath()[0].matches(':focus-visible')) this.show(); });
    listen(this.shadowRoot, 'focusout', () => setTimeout(() => { if (document.activeElement !== this && !this.matches(':hover')) this.hide(); }, 0));
    listen(this.shadowRoot.querySelector('.close'), 'click', () => this.hide(true));
    listen(this.shadowRoot, 'keydown', event => { if (event.key === 'Escape') { event.stopPropagation(); this.hide(true); } });
    listen(document, 'pointerdown', event => { if (!event.composedPath().includes(this)) this.hide(); });
    listen(window, 'resize', () => this.position(), {passive: true});
    listen(window, 'scroll', () => this.position(), {passive: true});
    listen(this.shadowRoot.querySelector('.copy'), 'click', async () => {
      const feedback = this.shadowRoot.querySelector('.feedback');
      try { await navigator.clipboard.writeText(profileId); feedback.textContent = '小红书号已复制，打开小红书即可搜索。'; }
      catch { feedback.textContent = `小红书号：${profileId}，可长按或手动复制。`; }
    });
    if (this.hasAttribute('open')) this.show();
  }
  position() {
    if (!this.trigger || this.panel.hidden) return;
    const rect = this.trigger.getBoundingClientRect();
    this.style.setProperty('--sa-top', `${Math.max(12, rect.bottom + 12)}px`);
    const viewportWidth = document.documentElement.clientWidth;
    const maxRight = viewportWidth - this.panel.offsetWidth - 16;
    this.style.setProperty('--sa-right', `${Math.max(16, Math.min(viewportWidth - rect.right, maxRight))}px`);
  }
  show() {
    clearTimeout(this._closeTimer);
    this.panel.hidden = false;
    this.trigger.setAttribute('aria-expanded', 'true');
    this.position();
  }
  hide(restoreFocus = false) {
    clearTimeout(this._closeTimer);
    this.panel.hidden = true;
    this.trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) { this._ignoreFocus = true; this.trigger.focus(); queueMicrotask(() => { this._ignoreFocus = false; }); }
  }
  disconnectedCallback() { clearTimeout(this._closeTimer); this._abort?.abort(); }
}

if (!customElements.get('source-access')) customElements.define('source-access', SourceAccess);
