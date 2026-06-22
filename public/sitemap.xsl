<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html>
      <head>
        <title>XML Sitemap</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9ff; color: #1a1a2e; padding: 40px 20px; max-width: 1200px; margin: 0 auto; }
          h1 { color: #004ac6; font-size: 2em; margin-bottom: 10px; }
          p { color: #666; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
          th { background: #004ac6; color: white; padding: 16px; text-align: left; font-weight: 600; }
          td { padding: 14px 16px; border-bottom: 1px solid #eee; }
          tr:hover { background: #f0f4ff; }
          a { color: #004ac6; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .priority-high { color: #22c55e; font-weight: 600; }
          .priority-medium { color: #f59e0b; }
          .priority-low { color: #6b7280; }
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        <p>This is the XML sitemap for repeater.online, generated for search engines.</p>
        <table>
          <tr>
            <th>URL</th>
            <th>Last Modified</th>
            <th>Change Frequency</th>
            <th>Priority</th>
          </tr>
          <xsl:for-each select="s:urlset/s:url">
            <tr>
              <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
              <td><xsl:value-of select="s:lastmod"/></td>
              <td><xsl:value-of select="s:changefreq"/></td>
              <td>
                <xsl:choose>
                  <xsl:when test="s:priority >= 0.9">
                    <span class="priority-high"><xsl:value-of select="s:priority"/></span>
                  </xsl:when>
                  <xsl:when test="s:priority >= 0.5">
                    <span class="priority-medium"><xsl:value-of select="s:priority"/></span>
                  </xsl:when>
                  <xsl:otherwise>
                    <span class="priority-low"><xsl:value-of select="s:priority"/></span>
                  </xsl:otherwise>
                </xsl:choose>
              </td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>