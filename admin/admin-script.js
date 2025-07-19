
// 管理后台脚本

// 密码hash值
const PASSWORD_HASH = "384fde3636e6e01e0194d2976d8f26410af3e846e573379cb1a09e2f0752d8cc";

// 当前编辑的博客ID
let currentEditingBlog = null;

// 博客数据存储
let blogs = [];

// 当前博客封面图片
let currentCoverImage = null;

// 作品数据存储
let portfolios = [];

// 当前编辑的作品ID
let currentEditingPortfolio = null;

// 当前作品图片
let currentPortfolioImage = null;

// SHA256加密函数
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// 检查密码
async function checkPassword() {
  const input = document.getElementById('password-input');
  const password = input.value;
  const errorDiv = document.getElementById('error-message');
  
  if (!password) {
    errorDiv.textContent = '请输入密码';
    return;
  }
  
  const hash = await sha256(password);
  
  if (hash === PASSWORD_HASH) {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('admin-main').style.display = 'block';
    sessionStorage.setItem('amubis_admin_auth', 'true');
    loadBlogList();
  } else {
    errorDiv.textContent = '密码错误';
    input.value = '';
  }
}

// 退出登录
function logout() {
  sessionStorage.removeItem('amubis_admin_auth');
  document.getElementById('login-overlay').style.display = 'flex';
  document.getElementById('admin-main').style.display = 'none';
  document.getElementById('password-input').value = '';
  document.getElementById('error-message').textContent = '';
}

// 检查登录状态
function checkAuth() {
  if (sessionStorage.getItem('amubis_admin_auth') === 'true') {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('admin-main').style.display = 'block';
    loadBlogList();
  }
}

// 显示指定section
function showSection(sectionId) {
  // 隐藏所有section
  document.querySelectorAll('.admin-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // 移除所有导航按钮的active状态
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // 显示指定section
  document.getElementById(sectionId).classList.add('active');
  
  // 激活对应的导航按钮
  const navButtons = {
    'blog-list': '[onclick="showSection(\'blog-list\')"]',
    'blog-editor': '[onclick="showSection(\'blog-editor\')"]',
    'portfolio-list': '[onclick="showSection(\'portfolio-list\')"]',
    'portfolio-editor': '[onclick="showSection(\'portfolio-editor\')"]'
  };
  
  const activeButton = document.querySelector(navButtons[sectionId]);
  if (activeButton) {
    activeButton.classList.add('active');
  }
  
  // 如果切换到作品列表，加载作品数据
  if (sectionId === 'portfolio-list') {
    loadPortfolioList();
  }
}

// 从JSON文件加载博客数据
async function loadBlogsFromJSON() {
  try {
    const response = await fetch('../blogs.json');
    if (response.ok) {
      blogs = await response.json();
    } else {
      blogs = [];
    }
  } catch (error) {
    console.log('博客文件不存在，创建新的博客列表');
    blogs = [];
  }
}

// 从JSON文件加载作品数据
async function loadPortfoliosFromJSON() {
  try {
    const response = await fetch('../portfolios.json');
    if (response.ok) {
      portfolios = await response.json();
    } else {
      portfolios = [];
    }
  } catch (error) {
    console.log('作品文件不存在，创建新的作品列表');
    portfolios = [];
  }
}

// 保存博客数据到JSON文件
function saveBlogsToJSON() {
  const dataStr = JSON.stringify(blogs, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  
  // 创建下载链接
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = 'blogs.json';
  link.click();
  
  // 提示用户
  alert('博客数据已导出为 blogs.json 文件，请将此文件放置在网站根目录下！');
}

// 保存作品数据到JSON文件
function savePortfoliosToJSON() {
  const dataStr = JSON.stringify(portfolios, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  
  // 创建下载链接
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = 'portfolios.json';
  link.click();
  
  // 提示用户
  alert('作品数据已导出为 portfolios.json 文件，请将此文件放置在网站根目录下！');
}

// 加载博客列表
function loadBlogList() {
  const container = document.getElementById('blogs-container');
  
  if (blogs.length === 0) {
    container.innerHTML = '<p style="color: var(--light-gray-70); text-align: center; margin: 50px 0;">暂无博客文章</p>';
    return;
  }
  
  container.innerHTML = blogs.map((blog, index) => `
    <div class="blog-item">
      <div class="blog-info">
        <h3>${blog.title}</h3>
        <p>分类: ${blog.category} | 创建时间: ${blog.date}</p>
      </div>
      <div class="blog-actions">
        <button class="edit-btn" onclick="editBlog(${index})">编辑</button>
        <button class="delete-btn" onclick="deleteBlog(${index})">删除</button>
      </div>
    </div>
  `).join('');
}

// 编辑博客
function editBlog(index) {
  currentEditingBlog = index;
  const blog = blogs[index];
  
  document.getElementById('blog-title').value = blog.title;
  document.getElementById('blog-category').value = blog.category;
  document.getElementById('blog-content').innerHTML = blog.content;
  document.getElementById('editor-title').textContent = '编辑博客';
  currentCoverImage = blog.coverImage || null;
  
  showSection('blog-editor');
}

// 删除博客
function deleteBlog(index) {
  if (confirm('确定要删除这篇博客吗？')) {
    blogs.splice(index, 1);
    saveBlogsToJSON();
    loadBlogList();
  }
}

// 格式化文本
function formatText(command) {
  document.execCommand(command, false, null);
  document.getElementById('blog-content').focus();
  updateToolbarButtons();
}

// 更新工具栏按钮状态
function updateToolbarButtons() {
  const buttons = {
    'bold': document.querySelector('[onclick="formatText(\'bold\')"]'),
    'italic': document.querySelector('[onclick="formatText(\'italic\')"]'),
    'underline': document.querySelector('[onclick="formatText(\'underline\')"]')
  };
  
  Object.entries(buttons).forEach(([command, button]) => {
    if (button) {
      if (document.queryCommandState(command)) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    }
  });
  
  // 检查是否在列表中
  const listButton = document.querySelector('[onclick="insertList()"]');
  if (listButton) {
    if (document.queryCommandState('insertUnorderedList')) {
      listButton.classList.add('active');
    } else {
      listButton.classList.remove('active');
    }
  }
}

// 插入标题
function insertHeading() {
  const content = document.getElementById('blog-content');
  if (content.innerHTML.includes('在这里输入博客内容...')) {
    content.innerHTML = '';
  }
  const text = prompt('请输入标题文本:');
  if (text) {
    content.focus();
    document.execCommand('formatBlock', false, 'h3');
    if (content.innerHTML === '<h3><br></h3>') {
      content.innerHTML = `<h3>${text}</h3><p><br></p>`;
    }
  }
}

// 插入列表
function insertList() {
  const content = document.getElementById('blog-content');
  if (content.innerHTML.includes('在这里输入博客内容...')) {
    content.innerHTML = '';
  }
  content.focus();
  document.execCommand('insertUnorderedList', false, null);
}

// 插入图片
function insertImage() {
  const content = document.getElementById('blog-content');
  if (content.innerHTML.includes('在这里输入博客内容...')) {
    content.innerHTML = '';
  }
  const url = prompt('请输入图片URL:');
  if (url) {
    content.focus();
    document.execCommand('insertImage', false, url);
  }
}

// 保存博客
function saveBlog() {
  const title = document.getElementById('blog-title').value.trim();
  const category = document.getElementById('blog-category').value.trim();
  const content = document.getElementById('blog-content').innerHTML;
  
  if (!title) {
    alert('请输入博客标题');
    return;
  }
  
  if (!category) {
    alert('请输入博客分类');
    return;
  }
  
  if (!content || content.trim() === '' || content.includes('在这里输入博客内容...')) {
    alert('请输入博客内容');
    return;
  }
  
  const blog = {
    title,
    category,
    content,
    coverImage: currentCoverImage,
    date: new Date().toLocaleDateString('zh-CN'),
    id: Date.now()
  };
  
  if (currentEditingBlog !== null) {
    // 编辑现有博客
    blogs[currentEditingBlog] = blog;
    currentEditingBlog = null;
  } else {
    // 新建博客
    blogs.unshift(blog);
  }
  
  // 保存到JSON文件
  saveBlogsToJSON();
  
  alert('博客保存成功！请将生成的 blogs.json 文件上传到网站根目录。');
  clearEditor();
  showSection('blog-list');
  loadBlogList();
}

// 预览博客
function previewBlog() {
  const title = document.getElementById('blog-title').value;
  const content = document.getElementById('blog-content').innerHTML;
  
  const previewWindow = window.open('', '_blank', 'width=800,height=600');
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <link rel="stylesheet" href="../assets/css/style.css">
      <style>
        body { background: var(--smoky-black); padding: 20px; }
        .preview-container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: var(--eerie-black-2);
          border: 1px solid var(--jet);
          border-radius: 20px;
          padding: 30px;
        }
        h1 { color: var(--white-2); margin-bottom: 20px; }
        .content { color: var(--light-gray); line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <h1>${title}</h1>
        <div class="content">${content}</div>
      </div>
    </body>
    </html>
  `);
}

// 取消编辑
function cancelEdit() {
  if (confirm('确定要取消编辑吗？未保存的内容将丢失。')) {
    clearEditor();
    showSection('blog-list');
  }
}

// 清空编辑器
function clearEditor() {
  document.getElementById('blog-title').value = '';
  document.getElementById('blog-category').value = '';
  document.getElementById('blog-content').innerHTML = '<p style="color: #888; font-style: italic;">在这里输入博客内容...</p>';
  document.getElementById('editor-title').textContent = '新建博客';
  currentEditingBlog = null;
  currentCoverImage = null;
}

// 返回主页
function goToHomePage() {
  window.location.href = "../index.html";
}

// 处理封面图片上传
document.getElementById('blog-cover').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      currentCoverImage = e.target.result;
      
      // 自动将封面图片插入到博客内容中
      const content = document.getElementById('blog-content');
      if (content.innerHTML.includes('在这里输入博客内容...')) {
        content.innerHTML = '';
      }
      
      const img = `<img src="${e.target.result}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
      
      // 如果内容为空或只有占位符，直接插入图片
      if (content.innerHTML.trim() === '' || content.innerHTML === '<br>') {
        content.innerHTML = img + '<p><br></p>';
      } else {
        // 在现有内容前插入图片
        content.innerHTML = img + content.innerHTML;
      }
      
      alert('封面图片已设置并插入到内容中');
    };
    reader.readAsDataURL(file);
  }
});

// 处理内容图片上传
document.getElementById('blog-image').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = `<img src="${e.target.result}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
      const content = document.getElementById('blog-content');
      if (content.innerHTML.includes('在这里输入博客内容...')) {
        content.innerHTML = img;
      } else {
        content.innerHTML += img;
      }
    };
    reader.readAsDataURL(file);
  }
});

// 密码输入框回车事件
document.getElementById('password-input').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    checkPassword();
  }
});

// 编辑器焦点处理
document.getElementById('blog-content').addEventListener('focus', function() {
  if (this.innerHTML.includes('在这里输入博客内容...')) {
    this.innerHTML = '';
  }
});

document.getElementById('blog-content').addEventListener('blur', function() {
  if (this.innerHTML.trim() === '' || this.innerHTML === '<br>') {
    this.innerHTML = '<p style="color: #888; font-style: italic;">在这里输入博客内容...</p>';
  }
});

// 监听内容变化以更新按钮状态
document.getElementById('blog-content').addEventListener('keyup', updateToolbarButtons);
document.getElementById('blog-content').addEventListener('mouseup', updateToolbarButtons);
document.getElementById('blog-content').addEventListener('input', updateToolbarButtons);

// 加载作品列表
function loadPortfolioList() {
  const container = document.getElementById('portfolio-container');
  
  if (portfolios.length === 0) {
    container.innerHTML = '<p style="color: var(--light-gray-70); text-align: center; margin: 50px 0;">暂无作品</p>';
    return;
  }
  
  container.innerHTML = portfolios.map((portfolio, index) => `
    <div class="blog-item">
      <div class="blog-info">
        <h3>${portfolio.title}</h3>
        <p>分类: ${portfolio.category} | 创建时间: ${portfolio.date}</p>
      </div>
      <div class="blog-actions">
        <button class="edit-btn" onclick="editPortfolio(${index})">编辑</button>
        <button class="delete-btn" onclick="deletePortfolio(${index})">删除</button>
      </div>
    </div>
  `).join('');
}

// 编辑作品
function editPortfolio(index) {
  currentEditingPortfolio = index;
  const portfolio = portfolios[index];
  
  document.getElementById('portfolio-title').value = portfolio.title;
  document.getElementById('portfolio-category').value = portfolio.category;
  document.getElementById('portfolio-link').value = portfolio.link || '';
  document.getElementById('portfolio-description').value = portfolio.description || '';
  document.getElementById('portfolio-editor-title').textContent = '编辑作品';
  currentPortfolioImage = portfolio.image || null;
  
  showSection('portfolio-editor');
}

// 删除作品
function deletePortfolio(index) {
  if (confirm('确定要删除这个作品吗？')) {
    portfolios.splice(index, 1);
    savePortfoliosToJSON();
    loadPortfolioList();
  }
}

// 保存作品
function savePortfolio() {
  const title = document.getElementById('portfolio-title').value.trim();
  const category = document.getElementById('portfolio-category').value.trim();
  const link = document.getElementById('portfolio-link').value.trim();
  const description = document.getElementById('portfolio-description').value.trim();
  
  if (!title) {
    alert('请输入作品标题');
    return;
  }
  
  if (!category) {
    alert('请选择作品分类');
    return;
  }
  
  if (!currentPortfolioImage) {
    alert('请上传作品图片');
    return;
  }
  
  const portfolio = {
    title,
    category,
    link,
    description,
    image: currentPortfolioImage,
    date: new Date().toLocaleDateString('zh-CN'),
    id: Date.now()
  };
  
  if (currentEditingPortfolio !== null) {
    // 编辑现有作品
    portfolios[currentEditingPortfolio] = portfolio;
    currentEditingPortfolio = null;
  } else {
    // 新建作品
    portfolios.unshift(portfolio);
  }
  
  savePortfoliosToJSON();
  
  alert('作品保存成功！');
  clearPortfolioEditor();
  showSection('portfolio-list');
  loadPortfolioList();
}

// 取消作品编辑
function cancelPortfolioEdit() {
  if (confirm('确定要取消编辑吗？未保存的内容将丢失。')) {
    clearPortfolioEditor();
    showSection('portfolio-list');
  }
}

// 清空作品编辑器
function clearPortfolioEditor() {
  document.getElementById('portfolio-title').value = '';
  document.getElementById('portfolio-category').value = '';
  document.getElementById('portfolio-link').value = '';
  document.getElementById('portfolio-description').value = '';
  document.getElementById('portfolio-editor-title').textContent = '新建作品';
  currentEditingPortfolio = null;
  currentPortfolioImage = null;
}

// 处理作品图片上传
document.getElementById('portfolio-image').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      currentPortfolioImage = e.target.result;
      alert('作品图片已设置');
    };
    reader.readAsDataURL(file);
  }
});

// 页面加载时检查登录状态并加载数据
window.addEventListener('load', async function() {
  await loadBlogsFromJSON();
  await loadPortfoliosFromJSON();
  checkAuth();
});
