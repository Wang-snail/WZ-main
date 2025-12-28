import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Download,
    ArrowRight,
    AlertCircle,
    CheckCircle,
    FileSpreadsheet,
    File as FileIcon,
    Play,
    Zap
} from 'lucide-react';

import { Button } from '../../../../../components/ui/button';
import {
    useKanoToolStore,
    useShallow,
    selectFileActions,
    selectUIState,
    selectActionActions,
    selectDataActions,
    WorkflowStep
} from '../../store/kanoToolStore';
import { FileParserService } from '../../services/FileParserService';
import { saveAs } from 'file-saver';

export function ConversionStep() {
    const { isAutoRunning, loading, error } = useKanoToolStore(useShallow(selectUIState));
    const { currentFile, setCurrentFile } = useKanoToolStore(useShallow(s => ({ currentFile: s.currentFile, setCurrentFile: s.setCurrentFile })));
    const { setLoading: setStoreLoading, setError: setStoreError } = useKanoToolStore(useShallow(selectUIActions));
    const { setStepStatus, nextStep, startAutoAnalysis } = useKanoToolStore(useShallow(selectActionActions));
    const { setRawComments } = useKanoToolStore(useShallow(selectDataActions));

    const ui = { isAutoRunning, loading, error }; // Compatibility

    const [convertedFiles, setConvertedFiles] = useState<{ name: string; content: string }[]>([]);
    const [converting, setConverting] = useState(false);

    useEffect(() => {
        // 如果是自动运行模式且没有文件，直接跳过转换步骤
        if (ui.isAutoRunning && !currentFile) {
            setStepStatus(WorkflowStep.CONVERT, 'completed');
            return;
        }

        if (!currentFile) {
            // 如果不是自动运行模式且没有文件，显示错误
            if (!ui.isAutoRunning) {
                setStoreError('未找到可转换的文件，请返回导入步骤重新上传');
            }
            return;
        }

        // 自动开始转换
        handleConvert();
    }, [currentFile, ui.isAutoRunning]);

    const handleConvert = async () => {
        if (!currentFile) return;

        setConverting(true);
        setStoreLoading(true);
        setStoreError(null);

        try {
            let result: { name: string; content: string }[] = [];
            const extension = currentFile.name.split('.').pop()?.toLowerCase();

            if (['xlsx', 'xls'].includes(extension || '')) {
                result = await FileParserService.convertExcelToMarkdown(currentFile);
            } else if (['docx'].includes(extension || '')) {
                result = await FileParserService.convertWordToMarkdown(currentFile);
            } else {
                // 对于不支持转换或不需要转换的文件，直接通过
                setStepStatus(WorkflowStep.CONVERT, 'completed');
                nextStep(); // 自动跳过
                return;
            }

            setConvertedFiles(result);
            setStepStatus(WorkflowStep.CONVERT, 'completed');
        } catch (error) {
            setStoreError(error instanceof Error ? error.message : '转换失败');
            setStepStatus(WorkflowStep.CONVERT, 'error');
        } finally {
            setConverting(false);
            setStoreLoading(false);
        }
    };

    const handleDownload = (fileName: string, content: string) => {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        saveAs(blob, `${fileName}.md`);
    };

    const handleDownloadAll = () => {
        convertedFiles.forEach(file => {
            handleDownload(file.name, file.content);
        });
    };

    const handleAnalyze = (content: string, source: string) => {
        const comments = FileParserService.parseTextContent(content, source);
        setRawComments(comments);
        setStepStatus(WorkflowStep.CONVERT, 'completed');
        nextStep();
    };

    const handleAnalyzeAll = () => {
        const allComments = convertedFiles.flatMap(file =>
            FileParserService.parseTextContent(file.content, file.name)
        );
        setRawComments(allComments);
        setStepStatus(WorkflowStep.CONVERT, 'completed');
        nextStep();
    };

    if (!currentFile) {
        if (ui.isAutoRunning) {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">格式转换完成</h3>
                        <p className="text-gray-600 mt-2">数据已准备就绪，无需格式转换</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">未找到文件</h3>
                <p className="text-gray-600 mt-2">请返回上一步上传文件</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">格式转换</h2>
                <p className="text-gray-600">
                    将上传的文件转换为 Markdown 格式，便于查看和编辑。支持多工作表拆分。
                </p>
            </div>

            {converting ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">正在转换文件的格式...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                    {currentFile.name.endsWith('.xlsx') || currentFile.name.endsWith('.xls') ? (
                                        <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                                    ) : (
                                        <FileIcon className="w-6 h-6 text-blue-600" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">{currentFile.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {(currentFile.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button onClick={handleDownloadAll} variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    全部下载
                                </Button>
                                <Button onClick={handleAnalyzeAll} size="sm" className="ml-2">
                                    <Play className="w-4 h-4 mr-2" />
                                    全部加入分析
                                </Button>
                                <Button
                                    onClick={startAutoAnalysis}
                                    size="sm"
                                    className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={ui.isAutoRunning}
                                >
                                    {ui.isAutoRunning ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    ) : (
                                        <Zap className="w-4 h-4 mr-2" />
                                    )}
                                    一键自动分析
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {convertedFiles.map((file, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="border rounded-lg p-4 hover:border-blue-400 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center">
                                            <FileText className="w-5 h-5 text-gray-400 mr-2" />
                                            <span className="font-medium text-gray-700 truncate max-w-[150px]" title={file.name}>
                                                {file.name}.md
                                            </span>
                                        </div>
                                        <div className="flex space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDownload(file.name, file.content)}
                                                title="下载 Markdown"
                                            >
                                                <Download className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-2 space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDownload(file.name, file.content)}
                                            className="text-xs h-7"
                                        >
                                            <Download className="w-3 h-3 mr-1" />
                                            下载
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleAnalyze(file.content, file.name)}
                                            className="text-xs h-7"
                                        >
                                            <Play className="w-3 h-3 mr-1" />
                                            分析此内容
                                        </Button>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded max-h-20 overflow-hidden relative">
                                        {file.content.slice(0, 100)}...
                                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent"></div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 flex-col items-end">
                        <Button
                            onClick={nextStep}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            下一步：数据整理
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <p className="text-xs text-gray-400 mt-2">
                            点击"全部加入分析"或"分析此内容"将转换后的数据传入下一步，或者点击"一键自动分析"直接完成所有步骤
                        </p>
                    </div>
                </div>
            )}

            {ui.error && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700"
                >
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {ui.error}
                </motion.div>
            )}
        </div>
    );
}
