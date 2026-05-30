# GRSCorp Blog System
**Automated blog publishing for grscorp.us/blogs/**

---

## 🎯 What This Is

This GitHub repository contains the blog content for **grscorp.us/blogs** — a new automated blog system that works alongside your existing WordPress site.

- **WordPress (grscorp.us):** Your 109 existing blogs stay here, unchanged
- **GitHub (grscorp-blogs):** New blogs are created and published here, served at grscorp.us/blogs/

This hybrid approach keeps your SEO rankings intact while adding a modern automated workflow.

---

## 📁 Folder Structure

```
grscorp-blogs/
├── index.html                  # Blog listing page
├── BLOG_POST_TEMPLATE.html     # Template for new blog posts
├── README.md                   # This file
├── .gitignore                  # Git ignore rules
├── assets/
│   └── css/
│       └── style.css           # Blog styling
└── posts/
    └── [your-blog-posts].html  # Individual blog posts go here
```

---

## ✍️ How to Create a New Blog Post

### Step 1: Create the Blog Post
The process is simple:

1. **Ask Claude:** Write a blog about [topic]
2. **Claude creates:** A new HTML file with your blog content
3. **Claude commits:** Pushes to GitHub automatically
4. **Site updates:** Your blog appears live at grscorp.us/blogs/

### Step 2: File Naming Convention
Blog post filenames should:
- Use lowercase
- Use hyphens instead of spaces
- Include the date (optional but recommended)
- End with `.html`

**Examples:**
- `my-first-blog-post.html`
- `2026-05-30-autism-awareness.html`
- `capital-region-real-estate-may-2026.html`

### Step 3: Blog Post Structure
Use the `BLOG_POST_TEMPLATE.html` file as your starting point. Each blog post needs:

- **Title:** Clear, descriptive heading
- **Meta Information:** Date, author, category
- **Content:** Use standard HTML tags:
  - `<p>` for paragraphs
  - `<h2>`, `<h3>` for subheadings
  - `<ul>`, `<ol>` for lists
  - `<strong>`, `<em>` for emphasis
  - `<img>` for images
  - `<blockquote>` for quotes

### Example Blog Post

```html
<div class="post-content">
    <p>Introduction paragraph that hooks the reader...</p>
    
    <h2>Main Section</h2>
    <p>Your main content goes here with multiple paragraphs.</p>
    
    <h2>Key Points</h2>
    <ul>
        <li>First point</li>
        <li>Second point</li>
        <li>Third point</li>
    </ul>
    
    <h2>Conclusion</h2>
    <p>Wrap up your thoughts here.</p>
</div>
```

---

## 🎨 Styling & Design

All blog posts automatically use the professional GRSCorp style from `assets/css/style.css`:

- Clean, modern design
- Mobile responsive
- Professional color scheme (blues and whites)
- Accessibility features
- Fast loading

**You don't need to style anything** — just write the content in HTML.

---

## 🚀 Deployment Workflow

### Automatic (Most Common)

1. You request a blog post: *"Write a blog about..."*
2. Claude creates the file
3. Claude commits to GitHub: `posts/[filename].html`
4. GitHub Pages deploys automatically
5. **Blog appears live at:** `https://grscorp.us/blogs/posts/[filename].html`

**Time to live:** 1-2 minutes

### Manual (If Needed)

If you need to edit a blog directly:

```bash
# 1. Clone this repo
git clone https://github.com/[your-username]/grscorp-blogs.git
cd grscorp-blogs

# 2. Create your post in the posts/ folder
# (Copy BLOG_POST_TEMPLATE.html and edit it)

# 3. Commit and push
git add posts/your-post.html
git commit -m "Add new blog post: Your Post Title"
git push origin main

# 4. Check https://grscorp.us/blogs/ (wait 1-2 min)
```

---

## 📋 Blog Post Checklist

Before publishing, make sure your blog has:

- [ ] Clear, descriptive title
- [ ] Date of publication
- [ ] Author name
- [ ] Relevant category
- [ ] Introduction paragraph
- [ ] 2-3 main sections with subheadings
- [ ] Conclusion/summary
- [ ] Links back to grscorp.us (for SEO)
- [ ] Images (optional but recommended)
- [ ] Call-to-action (donation, volunteer, etc.)

---

## 🔗 Important Links

| What | Link |
|------|------|
| Blog Home | https://grscorp.us/blogs/ |
| WordPress Site | https://grscorp.us |
| GitHub Repo | https://github.com/asadmunirbutt-lang/grscorp-blogs |
| Style Reference | View `assets/css/style.css` |

---

## 💡 Tips for Great Blog Posts

### SEO Tips
- Include relevant keywords in the title
- Link back to grscorp.us pages (for internal linking)
- Write descriptive meta descriptions
- Use proper heading hierarchy (h2, h3, not h1)

### Content Tips
- Keep paragraphs short (2-3 sentences)
- Use lists for multiple points
- Include real data and statistics
- Add images when relevant
- Link to credible sources

### Engagement Tips
- Start with a hook/question
- Use subheadings to break up content
- Include a call-to-action at the end
- Ask readers to share or comment

---

## ❓ FAQ

**Q: Can I use WordPress posts?**  
A: No. Keep WordPress blogs on grscorp.us. Use this system only for NEW blogs.

**Q: How long does deployment take?**  
A: 1-2 minutes from GitHub commit to live site.

**Q: Can I edit a blog after publishing?**  
A: Yes! Make changes to the HTML file and commit again. Site updates automatically.

**Q: What if I want to delete a blog?**  
A: Delete the HTML file from the `posts/` folder and commit. The blog will no longer be visible.

**Q: Can I add images?**  
A: Yes! Use `<img src="/blogs/assets/images/[filename]" alt="description">` and add images to `assets/images/`

**Q: How do I link to other posts?**  
A: Use relative links: `<a href="/blogs/posts/other-post.html">Other Post</a>`

---

## 🛠️ Hostinger Configuration

For grscorp.us/blogs/ to serve GitHub content, you need:

### .htaccess Configuration

Add this to your Hostinger root `.htaccess`:

```apache
# Route /blogs/* to GitHub Pages
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_URI} ^/blogs/ [OR]
    RewriteCond %{REQUEST_URI} ^/blogs$
    RewriteRule ^blogs(/)?(.*)$ https://asadmunirbutt-lang.github.io/grscorp-blogs/$2 [P,L]
</IfModule>
```

**OR use a DNS CNAME:**

```
blogs.grscorp.us  → asadmunirbutt-lang.github.io
```

Then access at: `https://blogs.grscorp.us/` (easier setup)

---

## 🔐 Important Notes

- **Don't commit passwords or secrets** to this repo
- **Keep the main branch clean** — only commit working blog posts
- **Test locally** if making changes to structure
- **GitHub Pages is public** — only commit content you want visible

---

## 📞 Support

- Need to create a blog? Ask Claude: *"Write a blog about..."*
- Need to edit HTML? Edit the file locally and commit
- Need help? Check BLOG_POST_TEMPLATE.html for examples

---

## 📊 Blog Post Stats

**Track your blog posts:**
- Total published: ___ (update as you add posts)
- Most recent: ___ 
- Most popular: ___

---

*Last updated: May 30, 2026*  
*GRSCorp Blog System v1.0*
