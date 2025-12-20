import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { CommentData } from '../store/kanoToolStore';

export class FileParserService {
  /**
   * 解析CSV文件
   */
  static async parseCSV(file: File): Promise<CommentData[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        complete: (results) => {
          try {
            const comments: CommentData[] = results.data
              .map((row: any, index: number) => {
                // 尝试多种可能的列名
                const content = row['评论内容'] || row['content'] || row['comment'] ||
                  row['评论'] || row['内容'] || row['text'] ||
                  Object.values(row)[0] as string;

                if (!content || typeof content !== 'string' || content.trim().length === 0) {
                  return null;
                }

                return {
                  id: `csv_${index}`,
                  content: content.trim(),
                  source: file.name,
                  timestamp: row['时间'] || row['timestamp'] || row['date'] ?
                    new Date(row['时间'] || row['timestamp'] || row['date']) : undefined,
                  metadata: {
                    platform: row['平台'] || row['platform'] || 'csv_import',
                    rating: row['评分'] || row['rating'] ?
                      parseInt(row['评分'] || row['rating']) : undefined,
                    verified: row['已验证'] || row['verified'] ?
                      Boolean(row['已验证'] || row['verified']) : undefined,
                  }
                } as CommentData;
              })
              .filter((comment): comment is CommentData => comment !== null);

            resolve(comments);
          } catch (error) {
            reject(new Error(`CSV解析失败: ${error instanceof Error ? error.message : '未知错误'}`));
          }
        },
        error: (error) => {
          reject(new Error(`CSV文件读取失败: ${error.message}`));
        }
      });
    });
  }

  /**
   * 解析Excel文件
   */
  static async parseExcel(file: File): Promise<CommentData[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // 获取第一个工作表
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error('Excel文件中没有找到工作表');
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        throw new Error('Excel文件为空');
      }

      // 假设第一行是标题行
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1) as any[][];

      const comments: CommentData[] = dataRows
        .map((row, index) => {
          // 找到评论内容列
          let contentIndex = -1;
          const possibleContentHeaders = ['评论内容', 'content', 'comment', '评论', '内容', 'text'];

          for (const header of possibleContentHeaders) {
            contentIndex = headers.findIndex(h =>
              h && h.toString().toLowerCase().includes(header.toLowerCase())
            );
            if (contentIndex !== -1) break;
          }

          // 如果没找到明确的内容列，使用第一列
          if (contentIndex === -1) contentIndex = 0;

          const cellValue = row[contentIndex];
          // 强制转换为字符串，防止数字等类型导致被过滤
          const content = cellValue !== undefined && cellValue !== null ? String(cellValue) : '';

          if (!content || content.trim().length === 0) {
            return null;
          }

          // 查找其他可能的列
          const timestampIndex = headers.findIndex(h =>
            h && (h.toString().includes('时间') || h.toString().toLowerCase().includes('time'))
          );
          const platformIndex = headers.findIndex(h =>
            h && (h.toString().includes('平台') || h.toString().toLowerCase().includes('platform'))
          );
          const ratingIndex = headers.findIndex(h =>
            h && (h.toString().includes('评分') || h.toString().toLowerCase().includes('rating'))
          );

          return {
            id: `excel_${index}`,
            content: content.trim(),
            source: file.name,
            timestamp: timestampIndex !== -1 && row[timestampIndex] ?
              new Date(row[timestampIndex]) : undefined,
            metadata: {
              platform: platformIndex !== -1 && row[platformIndex] ?
                row[platformIndex].toString() : 'excel_import',
              rating: ratingIndex !== -1 && row[ratingIndex] ?
                parseInt(row[ratingIndex]) : undefined,
              verified: undefined,
            }
          } as CommentData;
        })
        .filter((comment): comment is CommentData => comment !== null);

      return comments;
    } catch (error) {
      throw new Error(`Excel解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 解析Word文档
   */
  static async parseWord(file: File): Promise<CommentData[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });

      if (!result.value || result.value.trim().length === 0) {
        throw new Error('Word文档为空或无法读取文本内容');
      }

      // 按段落分割文本
      const paragraphs = result.value
        .split(/\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const comments: CommentData[] = paragraphs.map((paragraph, index) => ({
        id: `word_${index}`,
        content: paragraph,
        source: file.name,
        metadata: {
          platform: 'word_import',
        }
      }));

      return comments;
    } catch (error) {
      throw new Error(`Word文档解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 解析纯文本文件
   */
  static async parseText(file: File): Promise<CommentData[]> {
    try {
      const text = await file.text();
      return this.parseTextContent(text, file.name);
    } catch (error) {
      throw new Error(`文本文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 解析CSV内容字符串（用于演示数据加载）
   */
  static parseCSVContent(csvContent: string): CommentData[] {
    const results = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true
    });

    if (results.errors.length > 0) {
      console.warn('CSV解析警告:', results.errors);
    }

    return results.data
      .map((row: any, index: number) => {
        const content = row['评论内容'] || row['content'] || row['comment'] ||
          row['评论'] || row['内容'] || row['text'] ||
          Object.values(row)[0] as string;

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
          return null;
        }

        return {
          id: `csv_${index}`,
          content: content.trim(),
          source: row['来源'] || row['source'] || 'demo_data',
          timestamp: row['时间'] || row['timestamp'] || row['date'] ?
            new Date(row['时间'] || row['timestamp'] || row['date']) : undefined,
          metadata: {
            platform: row['来源'] || row['平台'] || row['platform'] || 'demo_data',
            rating: row['评分'] || row['rating'] ?
              parseInt(row['评分'] || row['rating']) : undefined,
            verified: false,
          }
        } as CommentData;
      })
      .filter((comment): comment is CommentData => comment !== null);
  }

  /**
   * 解析文本内容
   */
  static parseTextContent(text: string, source: string = 'text_input'): CommentData[] {
    const lines = text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return lines.map((line, index) => ({
      id: `text_${index}`,
      content: line,
      source,
      metadata: {
        platform: source === 'text_input' ? 'manual_input' : 'text_file',
      }
    }));
  }

  /**
   * 根据文件类型自动选择解析方法
   */
  static async parseFile(file: File): Promise<CommentData[]> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'csv':
        return this.parseCSV(file);
      case 'xlsx':
      case 'xls':
        return this.parseExcel(file);
      case 'docx':
        return this.parseWord(file);
      case 'txt':
        return this.parseText(file);
      default:
        throw new Error(`不支持的文件格式: ${extension}。支持的格式：CSV, Excel (.xlsx/.xls), Word (.docx), 文本 (.txt)`);
    }
  }

  /**
   * 验证解析结果
   */
  static validateComments(comments: CommentData[]): {
    valid: CommentData[];
    invalid: { comment: any; reason: string }[];
  } {
    const valid: CommentData[] = [];
    const invalid: { comment: any; reason: string }[] = [];

    comments.forEach(comment => {
      if (!comment.content || comment.content.trim().length === 0) {
        invalid.push({ comment, reason: '评论内容为空' });
      } else if (comment.content.length < 2) {
        invalid.push({ comment, reason: '评论内容过短' });
      } else if (comment.content.length > 10000) {
        invalid.push({ comment, reason: '评论内容过长' });
      } else {
        valid.push(comment);
      }
    });

    return { valid, invalid };
  }

  /**
   * 将Excel文件转换为Markdown格式
   * 每个工作表转换为一个独立的Markdown内容
   */
  static async convertExcelToMarkdown(file: File): Promise<{ name: string; content: string }[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const result: { name: string; content: string }[] = [];

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (rows.length === 0) continue;

        // 转换为Markdown表格
        let markdown = '';

        // 1. 表头
        const headers = rows[0];
        markdown += '| ' + headers.map((h: any) => String(h || '')).join(' | ') + ' |\n';

        // 2. 分隔符
        markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

        // 3. 数据行
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          // 确保行长度与表头一致
          const paddedRow = Array(headers.length).fill('').map((_, idx) => String(row[idx] || ''));
          markdown += '| ' + paddedRow.join(' | ') + ' |\n';
        }

        result.push({
          name: sheetName,
          content: markdown
        });
      }

      return result;
    } catch (error) {
      throw new Error(`Excel转换失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 将Word文档转换为Markdown格式
   */
  static async convertWordToMarkdown(file: File): Promise<{ name: string; content: string }[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // 使用mammoth转换为HTML，然后简单处理为Markdown
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

      // 简单的HTML转Markdown处理
      const markdown = html
        .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
        .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
        .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<ul>(.*?)<\/ul>/g, '$1')
        .replace(/<li>(.*?)<\/li>/g, '- $1\n')
        // 移除其他HTML标签
        .replace(/<[^>]+>/g, '')
        // 解码HTML实体
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');

      return [{
        name: file.name.replace(/\.[^/.]+$/, ""),
        content: markdown.trim()
      }];
    } catch (error) {
      throw new Error(`Word转换失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

}