(() => {
  const board = document.getElementById('assistantBoard');
  if (!board) return;

  document.getElementById('strategyPopupStack')?.remove();
  document.getElementById('voiceParserWindow')?.remove();
  document.getElementById('phonePreview')?.remove();
  document.getElementById('commentModal')?.remove();
  document.getElementById('commentModalMask')?.remove();

  const videoData = [
    { id: 'v1', name: '速干短袖正面展示', type: '生成视频', modelId: 'qingyu', model: '乔青予', trigger: '商品讲解', triggerCount: 36, productIndex: '1', product: '吸湿速干图案短袖', productId: '3829850811488403472', cover: '../assets/models/current-video-user.png', detail: '正面展示（多款色）' },
    { id: 'v2', name: '面料细节展示', type: '生成视频', modelId: 'ruoxia', model: '林若夏', trigger: '主播口令', triggerCount: 18, productIndex: '1', product: '吸湿速干图案短袖', productId: '3829850811488403472', cover: '../assets/models/ruoxia-user.png', detail: '抬手展示面料、袖口和领口细节' },
    { id: 'v6', name: '短袖多款色轮播', type: '生成视频', modelId: 'qiaohu', model: '巧虎', trigger: '商品讲解', triggerCount: 24, productIndex: '1', product: '吸湿速干图案短袖', productId: '3829850811488403472', cover: '../assets/models/qiaohu-user.png', detail: '白色、黑色款色轮流展示' },
    { id: 'v7', name: '明星同款上身展示', type: '生成视频', modelId: 'qingyu', model: '乔青予', trigger: '商品讲解', triggerCount: 15, productIndex: '2', product: '王一博同款抗菌短袖', productId: '3829847837299048729', cover: '../assets/models/host-xiaoqing-half.png', detail: '正面站姿展示版型' },
    { id: 'v3', name: '福袋互动视频', type: '上传视频', modelId: 'qiaohu', model: '巧虎', trigger: '主播口令', triggerCount: 42, productIndex: '', product: '不关联商品', productId: '', cover: '../assets/models/qiaohu-user.png', detail: '口令关键词：福袋来了、参与福袋' },
    { id: 'v5', name: '关注直播间提醒', type: '上传视频', modelId: 'ruoxia', model: '林若夏', trigger: '评论触发', triggerCount: 29, productIndex: '', product: '不关联商品', productId: '', cover: '../assets/models/ruoxia-user.png', detail: '评论关键词：怎么关注、怎么领券' }
  ];

  const products = [
    { index: '1', name: 'HELLY HANSEN/HH 26吸湿速干透气后背图案运动短袖', id: '3829850811488403472', image: 'assets/product-1.png' },
    { index: '2', name: '【王一博同款】HELLY HANSEN/HH26夏情侣速干抗菌短袖', id: '3829847837299048729', image: 'assets/product-2.png' },
    { index: '3', name: 'HELLY HANSEN/HH 26夏男速干凉感舒适防晒百搭针织长裤', id: '3829846658187919626', image: 'assets/product-3.png' }
  ];

  let currentProduct = products[0];
  let currentVideo = videoData[0];
  let companionEnabled = true;
  let isPlaying = true;
  let autoModelId = '';
  let productPlaybackMode = 'loop';
  let voiceBoardEnabled = false;
  let queueIds = ['v3', 'v2', 'v6'];
  let draggedQueueId = '';
  let voiceTimer = null;
  let voiceDrag = null;

  const floatButton = document.getElementById('assistantFloat');
  floatButton.innerHTML = '<span class="orb"><img src="../assets/ai-banbo-mark.png" alt="" /></span><span class="vertical">AI<br>伴<br>播</span>';
  floatButton.setAttribute('aria-label', '打开AI伴播');

  board.innerHTML = `
    <div class="board-header">
      <div class="plugin-logo"><img id="pluginBrandLogo" src="../assets/ai-banbo-logo.png" alt="AI伴播" /><span class="version">直播中</span></div>
      <div class="header-actions"><div class="banbo-user-info"><img class="banbo-user-avatar" src="../assets/avatar-wangxinyi.png" alt="王欣怡" /><span><b>王欣怡</b><small>系统管理员</small></span></div><a class="header-btn" href="../index.html" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;text-decoration:none">打开后台</a><button class="header-btn" id="closeBoard" aria-label="收起AI伴播">↘</button></div>
    </div>
    <div class="board-body">
      <nav class="board-tabs"><button class="board-tab active" data-banbo-tab="control">伴播控制</button><button class="board-tab" data-banbo-tab="videos">伴播视频</button><button class="board-tab" data-banbo-tab="data">伴播数据</button></nav>
      <div class="tab-content active" data-banbo-panel="control">
        <div class="banbo-stack">
          <section class="banbo-card">
            <div class="banbo-status-row">
              <div class="banbo-inline"><span class="banbo-live-dot"></span><div class="banbo-status-copy"><b>三彩穿搭官方号</b><span>直播间正常连接 <button class="banbo-inline-action" id="voiceBoardButton">打开语音解析</button></span></div></div>
              <div class="banbo-switch-control"><span id="companionStatusText">AI伴播已开启</span><button class="switch on" id="companionSwitch" aria-label="开启或关闭AI伴播"></button></div>
            </div>
            <div class="banbo-setting-divider"></div>
            <div class="banbo-model-control"><div><label for="autoModelSelect">数字模特</label><span>仅自动触发所选模特的伴播视频，其他模特视频需手动选择播放</span></div><select id="autoModelSelect"><option value="">全部</option><option value="qingyu">乔青予</option><option value="ruoxia">林若夏</option><option value="qiaohu">巧虎</option></select></div>
            <div class="banbo-setting-divider"></div>
            <div class="banbo-model-control"><div><label for="productPlaybackMode">商品讲解播放方式</label><span id="productPlaybackHint">同一商品的视频轮流循环播放，直至结束商品讲解</span></div><select id="productPlaybackMode"><option value="loop">循环播放</option><option value="once">单次播放</option></select></div>
          </section>
          <section class="banbo-card">
            <div class="banbo-card-head"><h3>当前播放</h3><span class="banbo-tag green" id="playingState">播放中</span></div>
            <div class="banbo-playing">
              <img class="banbo-video-cover" id="currentVideoCover" src="${currentVideo.cover}" alt="正在播放视频" />
              <div><h4 id="currentVideoName">${currentVideo.name}</h4><div class="banbo-playing-product" id="currentPlayingProduct">${currentProduct.name}</div><div class="banbo-playing-meta"><span id="currentVideoModel">${currentVideo.model}</span> · <span id="currentVideoType">${currentVideo.type}</span> · <span id="currentVideoTrigger">${currentVideo.trigger}</span><br><span id="currentVideoDetail">${currentVideo.detail}</span></div><div class="banbo-progress"><span id="playingProgress"></span></div><div class="banbo-controls"><button class="banbo-btn primary" id="stopVideo">停止</button><button class="banbo-btn danger" id="nextVideo">播放下一个</button></div></div>
            </div>
            <div class="banbo-section-divider"></div>
            <div class="banbo-card-head"><h3>播放队列</h3><span id="playQueueCount"></span></div>
            <div class="banbo-queue-list" id="playQueue"></div>
          </section>
        </div>
      </div>
      <div class="tab-content" data-banbo-panel="videos">
        <div class="banbo-toolbar"><label class="banbo-video-model-filter" for="videoModelFilter"><span>数字模特</span><select id="videoModelFilter" aria-label="筛选数字模特"><option value="">全部</option><option value="qingyu">乔青予</option><option value="ruoxia">林若夏</option><option value="qiaohu">巧虎</option></select></label><input class="banbo-search" id="videoSearch" placeholder="搜索视频名称/商品名称/商品ID" /></div>
        <div class="banbo-video-list" id="videoList"></div>
      </div>
      <div class="tab-content" data-banbo-panel="data">
        <div class="banbo-stack">
          <section class="banbo-card"><div class="banbo-card-head"><h3>本场伴播数据</h3><span>实时</span></div><div class="banbo-stat-grid"><div class="banbo-stat"><span>伴播时长</span><b>1.6小时</b></div><div class="banbo-stat"><span>触发次数</span><b>18</b></div><div class="banbo-stat"><span>播放视频</span><b>26</b></div></div></section>
          <section class="banbo-card"><div class="banbo-card-head"><h3>触发方式统计</h3><span>共 18 次</span></div><div class="banbo-data-list"><div><span>商品讲解</span><b>11</b></div><div><span>主播口令</span><b>4</b></div><div><span>评论触发</span><b>3</b></div></div></section>
          <section class="banbo-card"><div class="banbo-card-head"><h3>伴播视频 Top10</h3><span>按播放次数倒序</span></div><div class="banbo-top-list"><div><i>1</i><img src="../assets/models/stripe-tank-half.png" alt="福袋互动视频封面" /><b>福袋互动视频</b><span>42 次</span></div><div><i>2</i><img src="../assets/models/host-xiaoqing-half.png" alt="速干短袖正面展示流封面" /><b>速干短袖正面展示流</b><span>36 次</span></div><div><i>3</i><img src="../assets/models/host-xiaoqing-half.png" alt="关注直播间提醒封面" /><b>关注直播间提醒</b><span>29 次</span></div><div><i>4</i><img src="../assets/models/fairy-dress-half.png" alt="短袖多款色轮播封面" /><b>短袖多款色轮播</b><span>24 次</span></div><div><i>5</i><img src="../assets/models/lyocell-blouse-half.png" alt="面料细节展示封面" /><b>面料细节展示</b><span>18 次</span></div><div><i>6</i><img src="../assets/models/stripe-tank-half.png" alt="明星同款上身展示封面" /><b>明星同款上身展示</b><span>15 次</span></div><div><i>7</i><img src="../assets/models/host-xiaoqing-half.png" alt="评论感谢互动封面" /><b>评论感谢互动</b><span>12 次</span></div><div><i>8</i><img src="../assets/models/fairy-dress-half.png" alt="优惠券领取提醒封面" /><b>优惠券领取提醒</b><span>9 次</span></div><div><i>9</i><img src="../assets/models/lyocell-blouse-half.png" alt="新品上身展示封面" /><b>新品上身展示</b><span>7 次</span></div><div><i>10</i><img src="../assets/models/stripe-tank-half.png" alt="关注抽奖提醒封面" /><b>关注抽奖提醒</b><span>5 次</span></div></div></section>
        </div>
      </div>
    </div>
    <div class="banbo-toast" id="banboToast"></div>
    <div class="banbo-modal-mask" id="banboConfirmMask"><div class="banbo-modal"><div class="banbo-modal-head"><span id="banboConfirmTitle">确认操作</span><button id="closeBanboConfirm" aria-label="关闭">×</button></div><div class="banbo-modal-body" id="banboConfirmMessage"></div><div class="banbo-modal-foot"><button class="banbo-btn" id="cancelBanboConfirm">取消</button><button class="banbo-btn primary" id="confirmBanboAction">确认</button></div></div></div>`;

  const voiceBoard = document.createElement('section');
  voiceBoard.className = 'banbo-voice-board';
  voiceBoard.id = 'banboVoiceBoard';
  voiceBoard.innerHTML = `
    <div class="banbo-voice-head"><div><span class="banbo-live-dot"></span><b>主播语音实时解析</b></div><div><button id="collapseVoiceBoard" aria-label="收起语音解析看板">−</button><button id="closeVoiceBoard" aria-label="关闭语音解析看板">×</button></div></div>
    <div class="banbo-voice-body" id="voiceBoardLines">
      <article><span>11:23:34</span><b>主播</b><p>这款短袖是接触凉感面料，穿上以后不会贴身，夏天出门很舒服。</p></article>
      <article><span>11:23:46</span><b>主播</b><p>大家看一下它后背的图案，还有白色和黑色两个颜色。</p></article>
      <article class="triggered"><span>11:23:51</span><b>触发记录</b><p>命中“商品讲解”，开始播放「速干短袖正面展示流」。</p></article>
    </div>`;
  document.body.appendChild(voiceBoard);

  const toast = document.getElementById('banboToast');
  const confirmMask = document.getElementById('banboConfirmMask');
  let pendingAction = null;

  function productVideos(productIndex, includeGlobal = false) {
    return videoData
      .filter(video => video.productIndex === productIndex || (includeGlobal && !video.productIndex))
      .slice(0, 1);
  }

  function automaticProductVideos(productIndex) {
    return videoData.filter(video => video.productIndex === productIndex && video.trigger === '商品讲解' && (!autoModelId || video.modelId === autoModelId));
  }

  function videoActionButton(action, videoId) {
    const config = {
      play: { label: '立即播放', className: 'primary', icon: '<polygon points="6 3 20 12 6 21 6 3"></polygon>' },
      next: { label: '下一条播放', className: '', icon: '<path d="M3 6h8"></path><path d="M3 12h8"></path><path d="M3 18h5"></path><path d="M17 5v8"></path><path d="M13 9h8"></path>' },
      remove: { label: '移除', className: 'danger', icon: '<circle cx="12" cy="12" r="9"></circle><path d="M8 12h8"></path>' }
    }[action];
    return `<button class="banbo-icon-btn ${config.className}" data-video-action="${action}" data-video-id="${videoId}" aria-label="${config.label}" title="${config.label}"><svg viewBox="0 0 24 24" aria-hidden="true">${config.icon}</svg></button>`;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function openConfirm(title, message, action) {
    document.getElementById('banboConfirmTitle').textContent = title;
    document.getElementById('banboConfirmMessage').textContent = message;
    pendingAction = action;
    confirmMask.classList.add('open');
  }

  function closeConfirm() {
    confirmMask.classList.remove('open');
    pendingAction = null;
  }

  function openTab(tab) {
    board.querySelectorAll('[data-banbo-tab]').forEach(button => button.classList.toggle('active', button.dataset.banboTab === tab));
    board.querySelectorAll('[data-banbo-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.banboPanel === tab));
  }

  function renderCurrentVideo() {
    document.getElementById('currentVideoCover').src = currentVideo.cover;
    document.getElementById('currentVideoName').textContent = currentVideo.name;
    document.getElementById('currentPlayingProduct').textContent = currentVideo.productIndex ? currentProduct.name : '不关联商品';
    document.getElementById('currentVideoModel').textContent = currentVideo.model;
    document.getElementById('currentVideoType').textContent = currentVideo.type;
    document.getElementById('currentVideoTrigger').textContent = currentVideo.trigger;
    document.getElementById('currentVideoDetail').textContent = currentVideo.detail;
    document.getElementById('playingState').textContent = isPlaying ? '播放中' : (companionEnabled ? '已停止' : '已暂停');
    document.getElementById('playingState').className = `banbo-tag ${isPlaying ? 'green' : 'gray'}`;
    document.getElementById('playingProgress').style.width = isPlaying ? '38%' : '0';
    document.getElementById('stopVideo').textContent = isPlaying ? '停止' : '播放';
    document.getElementById('companionStatusText').textContent = companionEnabled ? 'AI伴播已开启' : 'AI伴播已关闭';
    renderPlayQueue();
  }

  function renderPlayQueue() {
    const list = queueIds.map(id => videoData.find(video => video.id === id)).filter(Boolean);
    document.getElementById('playQueueCount').textContent = `${list.length} 条`;
    document.getElementById('playQueue').innerHTML = list.length ? list.map((video, index) => `
      <article class="banbo-queue-row" draggable="true" data-queue-video="${video.id}"><span class="banbo-drag" title="拖动排序">⋮⋮</span><span class="banbo-index">${String(index + 1).padStart(2, '0')}</span><img class="banbo-mini-cover" src="${video.cover}" alt="${video.name}" /><div><div class="banbo-row-title">${video.name}</div><div class="banbo-row-meta">${video.model} · ${video.trigger}${video.productIndex ? ` · ${video.product}` : ''}${index === 0 && video.id === 'v3' ? '<span class="banbo-insert-tag">触发插队</span>' : ''}</div></div><div class="banbo-queue-actions">${videoActionButton('play', video.id)}${videoActionButton('remove', video.id)}</div></article>`).join('') : '<div class="banbo-empty compact">暂无待播放视频</div>';
  }

  function playVideo(video) {
    currentVideo = video;
    if (video.productIndex) currentProduct = products.find(product => product.index === video.productIndex) || currentProduct;
    companionEnabled = true;
    isPlaying = true;
    document.getElementById('companionSwitch').classList.add('on');
    renderCurrentVideo();
    if (voiceBoardEnabled) appendVoiceLine('触发记录', `命中“${video.trigger}”，开始播放「${video.name}」。`, 'triggered');
    showToast(`正在播放：${video.name}`);
  }

  function playNextVideo() {
    const next = videoData.find(video => video.id === queueIds[0]);
    if (!next) {
      if (productPlaybackMode === 'once' && currentVideo.trigger === '商品讲解') {
        isPlaying = false;
        renderCurrentVideo();
        showToast('当前商品的视频已各播放一次');
      } else showToast('播放队列为空');
      return;
    }
    queueIds.shift();
    if (productPlaybackMode === 'loop' && currentVideo.trigger === '商品讲解' && currentVideo.productIndex === currentProduct.index) queueIds.push(currentVideo.id);
    playVideo(next);
  }

  function addNextVideo(video) {
    queueIds = [video.id, ...queueIds.filter(id => id !== video.id && id !== currentVideo.id)];
    renderPlayQueue();
    showToast(`已加入下一条：${video.name}`);
  }

  function renderVideos() {
    const keyword = document.getElementById('videoSearch').value.trim().toLowerCase();
    const modelId = document.getElementById('videoModelFilter').value;
    const list = videoData
      .filter(video => (!modelId || video.modelId === modelId) && (keyword ? `${video.name} ${video.product} ${video.productId} ${video.detail}`.toLowerCase().includes(keyword) : !video.productIndex))
      .sort((a, b) => b.triggerCount - a.triggerCount);
    document.getElementById('videoList').innerHTML = list.length ? list.map(video => `
      <article class="banbo-video-row"><img class="banbo-mini-cover" src="${video.cover}" alt="${video.name}" /><div><div class="banbo-row-title">${video.name}</div><div class="banbo-row-meta">${video.model} · ${video.trigger} · 已触发 ${video.triggerCount} 次${video.productIndex ? `<br>${video.product}` : ''}</div></div><div class="banbo-row-actions">${videoActionButton('play', video.id)}${videoActionButton('next', video.id)}</div></article>`).join('') : '<div class="banbo-empty">没有匹配的视频</div>';
  }

  function injectProductVideoCounts() {
    document.querySelectorAll('.product-row').forEach(row => {
      const product = products.find(item => item.index === row.dataset.index);
      const videos = productVideos(row.dataset.index);
      const actions = row.querySelector('.row-buttons');
      if (!actions || actions.querySelector('.banbo-product-video-entry') || !videos.length) return;
      const entry = document.createElement('span');
      entry.className = 'banbo-product-video-entry';
      entry.innerHTML = `<span>1 个伴播视频</span><div class="banbo-product-video-popover"><b>可用伴播视频</b>${videos.map(video => `<div class="banbo-popover-video"><img src="${video.cover}" alt="${video.name}" /><span><strong>${video.name}</strong><small>${video.model} · ${video.trigger} · 已触发 ${video.triggerCount} 次</small></span><div class="banbo-popover-actions">${videoActionButton('play', video.id)}${videoActionButton('next', video.id)}</div></div>`).join('')}</div>`;
      actions.insertBefore(entry, actions.querySelector('button'));
      if (product) row.dataset.banboProductId = product.id;
    });
  }

  function setCurrentProduct(product) {
    currentProduct = product;
    const videos = automaticProductVideos(product.index);
    if (videos.length) {
      queueIds = videos.slice(1).map(video => video.id);
      playVideo(videos[0]);
      showToast(productPlaybackMode === 'loop' ? '已开始循环播放当前商品视频' : `将依次播放 ${videos.length} 条视频各一次`);
    }
    else showToast(autoModelId ? '当前商品没有所选数字模特的伴播视频' : '当前讲解商品暂无可用伴播视频');
  }

  function appendVoiceLine(role, content, className = '') {
    const now = new Date();
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(value => String(value).padStart(2, '0')).join(':');
    const article = document.createElement('article');
    article.className = className;
    article.innerHTML = `<span>${time}</span><b>${role}</b><p>${content}</p>`;
    document.getElementById('voiceBoardLines').appendChild(article);
    article.scrollIntoView({ block: 'nearest' });
  }

  function setVoiceBoard(enabled) {
    voiceBoardEnabled = enabled;
    document.getElementById('voiceBoardButton').textContent = '打开语音解析';
    voiceBoard.classList.toggle('open', enabled);
    if (enabled) {
      voiceBoard.classList.remove('collapsed');
      document.getElementById('collapseVoiceBoard').textContent = '−';
      window.clearInterval(voiceTimer);
      voiceTimer = window.setInterval(() => appendVoiceLine('主播', '这款的版型比较宽松，大家可以看一下上身效果。'), 12000);
      showToast('主播语音实时解析看板已打开');
    } else {
      window.clearInterval(voiceTimer);
      showToast('主播语音实时解析看板已关闭');
    }
  }

  board.addEventListener('click', event => {
    const tab = event.target.closest('[data-banbo-tab]');
    if (tab) openTab(tab.dataset.banboTab);
    if (event.target.closest('#closeBoard')) board.classList.remove('open');
  });

  document.addEventListener('click', event => {
    const actionButton = event.target.closest('[data-video-action]');
    if (!actionButton) return;
    const video = videoData.find(item => item.id === actionButton.dataset.videoId);
    if (!video) return;
    if (actionButton.dataset.videoAction === 'play') {
      queueIds = queueIds.filter(id => id !== video.id);
      playVideo(video);
    } else if (actionButton.dataset.videoAction === 'next') {
      addNextVideo(video);
    } else {
      queueIds = queueIds.filter(id => id !== video.id);
      renderPlayQueue();
      showToast('已移出播放队列');
    }
  });

  document.getElementById('companionSwitch').addEventListener('click', event => {
    companionEnabled = !companionEnabled;
    isPlaying = companionEnabled;
    event.currentTarget.classList.toggle('on', companionEnabled);
    renderCurrentVideo();
    showToast(companionEnabled ? 'AI伴播已开启' : 'AI伴播已关闭');
  });
  document.getElementById('autoModelSelect').addEventListener('change', event => {
    autoModelId = event.target.value;
    const modelName = event.target.options[event.target.selectedIndex].textContent;
    showToast(autoModelId ? `数字模特：${modelName}` : '数字模特：全部');
  });
  document.getElementById('productPlaybackMode').addEventListener('change', event => {
    productPlaybackMode = event.target.value;
    const loop = productPlaybackMode === 'loop';
    document.getElementById('productPlaybackHint').textContent = loop ? '同一商品的视频轮流循环播放，直至结束商品讲解' : '点击讲解商品后，每条匹配视频仅播放一次';
    showToast(loop ? '商品讲解：循环播放' : '商品讲解：单次播放');
  });
  document.getElementById('voiceBoardButton').addEventListener('click', () => setVoiceBoard(true));
  document.getElementById('stopVideo').addEventListener('click', () => {
    isPlaying = !isPlaying;
    renderCurrentVideo();
    showToast(isPlaying ? '当前视频已继续播放' : '当前视频已停止，AI伴播仍保持开启');
  });
  document.getElementById('nextVideo').addEventListener('click', playNextVideo);
  document.getElementById('videoModelFilter').addEventListener('change', renderVideos);
  document.getElementById('videoSearch').addEventListener('input', renderVideos);

  document.getElementById('playQueue').addEventListener('dragstart', event => {
    const row = event.target.closest('[data-queue-video]');
    if (!row) return;
    draggedQueueId = row.dataset.queueVideo;
    row.classList.add('dragging');
  });
  document.getElementById('playQueue').addEventListener('dragover', event => {
    event.preventDefault();
    const row = event.target.closest('[data-queue-video]');
    document.querySelectorAll('.banbo-queue-row.drag-target').forEach(item => item.classList.remove('drag-target'));
    if (!row || row.dataset.queueVideo === draggedQueueId) return;
    row.classList.add('drag-target');
  });
  document.getElementById('playQueue').addEventListener('drop', event => {
    event.preventDefault();
    const row = event.target.closest('[data-queue-video]');
    if (!row || row.dataset.queueVideo === draggedQueueId) return;
    const from = queueIds.indexOf(draggedQueueId);
    const to = queueIds.indexOf(row.dataset.queueVideo);
    if (from < 0 || to < 0) return;
    queueIds.splice(to, 0, queueIds.splice(from, 1)[0]);
    renderPlayQueue();
    showToast('播放队列顺序已更新');
  });
  document.getElementById('playQueue').addEventListener('dragend', () => {
    draggedQueueId = '';
    renderPlayQueue();
  });

  document.getElementById('closeBanboConfirm').addEventListener('click', closeConfirm);
  document.getElementById('cancelBanboConfirm').addEventListener('click', closeConfirm);
  document.getElementById('confirmBanboAction').addEventListener('click', () => { const action = pendingAction; closeConfirm(); action?.(); });
  confirmMask.addEventListener('click', event => { if (event.target === confirmMask) closeConfirm(); });

  document.getElementById('closeVoiceBoard').addEventListener('click', () => setVoiceBoard(false));
  document.getElementById('collapseVoiceBoard').addEventListener('click', event => {
    const collapsed = voiceBoard.classList.toggle('collapsed');
    event.currentTarget.textContent = collapsed ? '+' : '−';
    event.currentTarget.setAttribute('aria-label', collapsed ? '展开语音解析看板' : '收起语音解析看板');
  });

  voiceBoard.querySelector('.banbo-voice-head').addEventListener('mousedown', event => {
    if (event.target.closest('button')) return;
    const rect = voiceBoard.getBoundingClientRect();
    const scale = Number(getComputedStyle(document.documentElement).getPropertyValue('--demo-scale')) || 1;
    voiceDrag = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, scale };
    voiceBoard.style.right = 'auto';
    document.body.style.userSelect = 'none';
  });
  window.addEventListener('mousemove', event => {
    if (!voiceDrag) return;
    const left = Math.max(8, (event.clientX - voiceDrag.offsetX) / voiceDrag.scale);
    const top = Math.max(8, (event.clientY - voiceDrag.offsetY) / voiceDrag.scale);
    voiceBoard.style.left = `${left}px`;
    voiceBoard.style.top = `${top}px`;
  });
  window.addEventListener('mouseup', () => {
    if (!voiceDrag) return;
    voiceDrag = null;
    document.body.style.userSelect = '';
  });

  document.querySelectorAll('.start-explain').forEach(button => button.addEventListener('click', () => {
    const product = products.find(item => item.index === button.dataset.product);
    if (product) setCurrentProduct(product);
  }));

  injectProductVideoCounts();
  renderVideos();
  renderCurrentVideo();
  board.classList.add('open');
})();
