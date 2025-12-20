import { CommentData, ProcessedComment, ProcessingOptions } from '../store/kanoToolStore';

export class DataCleaningService {
    /**
     * 清洗和标准化评论数据
     */
    static async clean(
        comments: CommentData[],
        options: ProcessingOptions,
        onProgress?: (progress: number) => void
    ): Promise<{ cleaned: ProcessedComment[], stats: { removed: number; duplicates: number; cleaned: number } }> {
        return new Promise((resolve) => {
            // 模拟异步处理，防止阻塞UI
            setTimeout(() => {
                let processedComments = [...comments];
                const stats = { removed: 0, duplicates: 0, cleaned: 0 };
                const totalSteps = 3;
                let currentStep = 0;

                const updateProgress = () => {
                    if (onProgress) {
                        onProgress((currentStep / totalSteps) * 100);
                    }
                };

                // 1. 去除空评论
                if (options.removeEmpty) {
                    const beforeCount = processedComments.length;
                    processedComments = processedComments.filter(comment =>
                        comment.content && comment.content.trim().length >= options.minLength
                    );
                    stats.removed = beforeCount - processedComments.length;
                }
                currentStep++;
                updateProgress();

                // 2. 去重处理
                if (options.removeDuplicates) {
                    const beforeCount = processedComments.length;
                    const seen = new Set();
                    processedComments = processedComments.filter(comment => {
                        const normalized = comment.content.trim().toLowerCase();
                        if (seen.has(normalized)) {
                            return false;
                        }
                        seen.add(normalized);
                        return true;
                    });
                    stats.duplicates = beforeCount - processedComments.length;
                }
                currentStep++;
                updateProgress();

                // 3. 文本清洗和标准化
                const cleanedComments: ProcessedComment[] = processedComments.map(comment => {
                    let cleanedContent = comment.content;

                    // 移除多余空格
                    cleanedContent = cleanedContent.replace(/\s+/g, ' ').trim();

                    // 应用过滤模式
                    if (options.filterPatterns && options.filterPatterns.length > 0) {
                        options.filterPatterns.forEach(pattern => {
                            try {
                                const regex = new RegExp(pattern, 'gi');
                                cleanedContent = cleanedContent.replace(regex, '');
                            } catch (e) {
                                console.warn('Invalid filter pattern:', pattern);
                            }
                        });
                    }

                    stats.cleaned++;

                    return {
                        ...comment,
                        cleanedContent,
                        features: [],
                        emotions: [],
                    };
                });
                currentStep++;
                updateProgress();

                resolve({ cleaned: cleanedComments, stats });
            }, 100);
        });
    }
}
