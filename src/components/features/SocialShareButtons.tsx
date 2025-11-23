import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, MessageSquare, Twitter, Facebook, Link2, Check, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface SocialShareProps {
  title: string;
  description: string;
  url?: string;
  hashtags?: string[];
}

const SocialShareButtons: React.FC<SocialShareProps> = ({
  title,
  description,
  url = window.location.href,
  hashtags = ['AI工具', '人工智能', 'WSNAIL']
}) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showWechatQR, setShowWechatQR] = useState(false);

  // 分享链接生成
  const generateShareUrl = (platform: string, additionalParams = {}) => {
    const params = new URLSearchParams({
      title,
      description,
      url,
      ...additionalParams
    });
    return `${window.location.origin}/share/${platform}?${params.toString()}`;
  };

  // 微博分享
  const shareToWeibo = () => {
    const shareUrl = generateShareUrl('weibo', {
      pic: `${window.location.origin}/images/og-image.jpg`,
      search: `#${hashtags.join('#')}`
    });
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // 微信分享（二维码）
  const shareToWechat = () => {
    setIsOpen(true);
    // 切换到微信分享视图
    setShowWechatQR(true);
  };

  // Twitter分享
  const shareToTwitter = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} - ${description}`)}&url=${encodeURIComponent(url)}&hashtags=${hashtags.join(',')}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Facebook分享
  const shareToFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`${title} - ${description}`)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // 复制链接
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 分享到知乎
  const shareToZhihu = () => {
    const shareUrl = `https://www.zhihu.com/question/19762922/answer/195689517?target_type=share&${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
  };

  // 分享到掘金
  const shareToJuejin = () => {
    const shareUrl = `https://juejin.cn/post/share?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&content=${encodeURIComponent(description)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          分享
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-4">
        {showWechatQR ? (
          <div className="flex flex-col items-center space-y-4">
            <h4 className="font-medium text-sm text-gray-900">微信扫一扫分享</h4>
            <div className="bg-white p-2 rounded-lg border">
              <QRCodeSVG value={url} size={160} />
            </div>
            <p className="text-xs text-gray-500 text-center">
              打开微信，点击右上角"+"，<br />选择"扫一扫"
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWechatQR(false)}
              className="text-gray-500"
            >
              返回
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-900">分享到</h4>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={shareToWeibo}
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4 text-red-500" />
                微博
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={shareToWechat}
                className="gap-2"
              >
                <MessageCircle className="w-4 h-4 text-green-500" />
                微信
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={shareToTwitter}
                className="gap-2"
              >
                <Twitter className="w-4 h-4 text-blue-400" />
                Twitter
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={shareToFacebook}
                className="gap-2"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </Button>
            </div>

            <div className="border-t pt-3">
              <h5 className="font-medium text-sm text-gray-900 mb-2">专业平台</h5>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareToZhihu}
                  className="gap-2 text-sm"
                >
                  知乎
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareToJuejin}
                  className="gap-2 text-sm"
                >
                  掘金
                </Button>
              </div>
            </div>

            <div className="border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="w-full gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    已复制链接
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    复制链接
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center pt-2">
              {hashtags.map(tag => `#${tag}`).join(' ')}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default SocialShareButtons;