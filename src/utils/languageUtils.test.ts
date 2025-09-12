import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SUPPORTED_LANGUAGES, getCurrentLanguage, setLanguage, generateLocalizedURL, extractLanguageFromURL } from './languageUtils'

describe('languageUtils', () => {
  beforeEach(() => {
    // 清除 localStorage
    localStorage.clear()
    // 重置 URL
    window.history.replaceState({}, '', window.location.pathname)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('SUPPORTED_LANGUAGES', () => {
    it('should contain expected languages', () => {
      expect(SUPPORTED_LANGUAGES).toHaveLength(9)
      expect(SUPPORTED_LANGUAGES[0]).toEqual({ code: 'zh', name: '中文', flag: '🇨🇳' })
      expect(SUPPORTED_LANGUAGES[1]).toEqual({ code: 'en', name: 'English', flag: '🇺🇸' })
    })
  })

  describe('getCurrentLanguage', () => {
    it('should return zh as default when no language is set', () => {
      const language = getCurrentLanguage()
      expect(language).toBe('zh')
    })

    it('should return language from URL parameter', () => {
      // 设置 URL 参数
      const url = new URL(window.location.href)
      url.searchParams.set('lang', 'en')
      window.history.replaceState({}, '', url.toString())

      const language = getCurrentLanguage()
      expect(language).toBe('en')
    })

    it('should return language from localStorage', () => {
      localStorage.setItem('preferred_language', 'ja')
      
      const language = getCurrentLanguage()
      expect(language).toBe('ja')
    })

    it('should prioritize URL parameter over localStorage', () => {
      localStorage.setItem('preferred_language', 'ja')
      
      // 设置 URL 参数
      const url = new URL(window.location.href)
      url.searchParams.set('lang', 'en')
      window.history.replaceState({}, '', url.toString())

      const language = getCurrentLanguage()
      expect(language).toBe('en')
    })
  })

  describe('setLanguage', () => {
    it('should set language in localStorage and update URL', () => {
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState')
      
      setLanguage('en')
      
      expect(localStorage.getItem('preferred_language')).toBe('en')
      expect(replaceStateSpy).toHaveBeenCalled()
      
      const currentUrl = new URL(window.location.href)
      expect(currentUrl.searchParams.get('lang')).toBe('en')
    })

    it('should not set unsupported language', () => {
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState')
      
      setLanguage('unsupported')
      
      expect(localStorage.getItem('preferred_language')).toBeNull()
      expect(replaceStateSpy).not.toHaveBeenCalled()
    })
  })

  describe('generateLocalizedURL', () => {
    it('should generate correct URL for default language', () => {
      const url = generateLocalizedURL('/about', 'zh')
      expect(url).toBe('/about')
    })

    it('should generate correct URL for non-default language', () => {
      const url = generateLocalizedURL('/about', 'en')
      expect(url).toBe('/en/about')
    })

    it('should handle root path for default language', () => {
      const url = generateLocalizedURL('/', 'zh')
      expect(url).toBe('/')
    })

    it('should handle root path for non-default language', () => {
      const url = generateLocalizedURL('/', 'en')
      expect(url).toBe('/en')
    })
  })

  describe('extractLanguageFromURL', () => {
    it('should extract language from URL with language prefix', () => {
      const result = extractLanguageFromURL('https://example.com/en/about')
      expect(result).toEqual({ lang: 'en', path: '/about' })
    })

    it('should return default language for URL without language prefix', () => {
      const result = extractLanguageFromURL('https://example.com/about')
      expect(result).toEqual({ lang: 'zh', path: '/about' })
    })

    it('should handle root path with language', () => {
      const result = extractLanguageFromURL('https://example.com/en')
      expect(result).toEqual({ lang: 'en', path: '/' })
    })

    it('should handle root path without language', () => {
      const result = extractLanguageFromURL('https://example.com/')
      expect(result).toEqual({ lang: 'zh', path: '/' })
    })
  })
})