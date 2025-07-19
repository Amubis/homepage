
// 博客显示功能 - 用于在主页面显示博客

function loadBlogsToMainPage() {
  const blogs = JSON.parse(localStorage.getItem('amubis_blogs') || '[]');
  const blogContainer = document.querySelector('.blog-posts-list');
  
  if (!blogContainer || blogs.length === 0) {
    return;
  }
  
  // 清空现有内容
  blogContainer.innerHTML = '';
  
  // 生成博客列表HTML
  const blogHTML = blogs.map(blog => `
    <li class="blog-post-item">
      <a href="#" onclick="showBlogDetail(${blog.id}); return false;">
        <figure class="blog-banner-box">
          <img src="../assets/images/blog-1.jpg" alt="${blog.title}" loading="lazy">
        </figure>
        
        <div class="blog-content">
          <div class="blog-meta">
            <p class="blog-category">${blog.category}</p>
            <span class="dot"></span>
            <time datetime="${blog.date}">${blog.date}</time>
          </div>
          
          <h3 class="h3 blog-item-title">${blog.title}</h3>
          
          <p class="blog-text">
            ${getTextPreview(blog.content)}
          </p>
        </div>
      </a>
    </li>
  `).join('');
  
  blogContainer.innerHTML = blogHTML;
}

// 获取内容预览
function getTextPreview(htmlContent) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  return textContent.substring(0, 120) + (textContent.length > 120 ? '...' : '');
}

// 显示博客详情
function showBlogDetail(blogId) {
  const blogs = JSON.parse(localStorage.getItem('amubis_blogs') || '[]');
  const blog = blogs.find(b => b.id === blogId);
  
  if (!blog) {
    alert('博客不存在');
    return;
  }
  
  // 创建模态窗口显示博客详情
  const modal = document.createElement('div');
  modal.className = 'blog-modal';
  modal.innerHTML = `
    <div class="blog-modal-overlay" onclick="closeBlogModal()"></div>
    <div class="blog-modal-content">
      <button class="blog-modal-close" onclick="closeBlogModal()">×</button>
      <div class="blog-modal-header">
        <h1>${blog.title}</h1>
        <div class="blog-modal-meta">
          <span class="blog-category">${blog.category}</span>
          <span class="blog-date">${blog.date}</span>
        </div>
      </div>
      <div class="blog-modal-body">
        ${blog.content}
      </div>
    </div>
  `;
  
  // 添加模态窗口样式
  if (!document.getElementById('blog-modal-styles')) {
    const styles = document.createElement('style');
    styles.id = 'blog-modal-styles';
    styles.textContent = `
      .blog-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
      }
      
      .blog-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
      }
      
      .blog-modal-content {
        position: relative;
        background: var(--eerie-black-2);
        border: 1px solid var(--jet);
        border-radius: 20px;
        max-width: 800px;
        max-height: 90vh;
        width: 100%;
        overflow-y: auto;
        box-shadow: var(--shadow-5);
      }
      
      .blog-modal-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: var(--onyx);
        border: none;
        color: var(--white-2);
        font-size: 24px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: var(--transition-1);
      }
      
      .blog-modal-close:hover {
        background: var(--orange-yellow-crayola);
        color: var(--smoky-black);
      }
      
      .blog-modal-header {
        padding: 30px 30px 20px;
        border-bottom: 1px solid var(--jet);
      }
      
      .blog-modal-header h1 {
        color: var(--white-2);
        font-size: var(--fs-1);
        margin-bottom: 15px;
      }
      
      .blog-modal-meta {
        display: flex;
        gap: 15px;
        align-items: center;
      }
      
      .blog-modal-meta .blog-category {
        background: var(--orange-yellow-crayola);
        color: var(--smoky-black);
        padding: 4px 12px;
        border-radius: 6px;
        font-size: var(--fs-8);
        font-weight: var(--fw-500);
      }
      
      .blog-modal-meta .blog-date {
        color: var(--light-gray-70);
        font-size: var(--fs-7);
      }
      
      .blog-modal-body {
        padding: 30px;
        color: var(--light-gray);
        line-height: 1.6;
        font-size: var(--fs-6);
      }
      
      .blog-modal-body h1,
      .blog-modal-body h2,
      .blog-modal-body h3 {
        color: var(--white-2);
        margin: 20px 0 10px;
      }
      
      .blog-modal-body img {
        max-width: 100%;
        height: auto;
        border-radius: 12px;
        margin: 15px 0;
      }
      
      .blog-modal-body ul,
      .blog-modal-body ol {
        margin: 15px 0;
        padding-left: 25px;
      }
      
      .blog-modal-body p {
        margin: 15px 0;
      }
    `;
    document.head.appendChild(styles);
  }
  
  document.body.appendChild(modal);
}

// 关闭博客模态窗口
function closeBlogModal() {
  const modal = document.querySelector('.blog-modal');
  if (modal) {
    modal.remove();
  }
}

// 页面加载时自动加载博客
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
  document.addEventListener('DOMContentLoaded', loadBlogsToMainPage);
}
