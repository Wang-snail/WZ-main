// robots.txt 生成器
export class RobotsTxtGenerator {
  // 生成robots.txt内容
  static generateRobotsTxt(): string {
    return `# Robotstxt for WSNAIL.COM
# Generated on ${new Date().toISOString().split('T')[0]}

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

# Sitemap files
Sitemap: https://wsnail.com/sitemap.xml

# Host
Host: https://wsnail.com

# Crawl-delay
Crawl-delay: 10
`;
  }
  
  // 生成多语言robots.txt
  static generateLocalizedRobotsTxt(): Record<string, string> {
    const languages = ['en', 'ja', 'ko', 'es'];
    const robots: Record<string, string> = {
      'zh': this.generateRobotsTxt()
    };
    
    languages.forEach(lang => {
      robots[lang] = `# Robotstxt for WSNAIL.COM
# Generated on ${new Date().toISOString().split('T')[0]}

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

# Sitemap files
Sitemap: https://wsnail.com/${lang}/sitemap.xml

# Host
Host: https://wsnail.com

# Crawl-delay
Crawl-delay: 10
`;
    });
    
    return robots;
  }
}