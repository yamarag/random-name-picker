import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'

describe('App', () => {
  beforeEach(() => {
    // localStorageをモック
    const localStorageMock = (() => {
      let store: Record<string, string> = {}
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value },
        clear: () => { store = {} },
      }
    })()
    vi.stubGlobal('localStorage', localStorageMock)

    // localStorageをクリア
    localStorageMock.clear()
  })

  it('入力欄とボタンが表示される', () => {
    render(<App />)

    // タイトル
    expect(screen.getByText('ランダム名前選び')).toBeInTheDocument()

    // 入力欄
    const textarea = screen.getByPlaceholderText('例: 田中, 山田, 佐藤, 鈴木')
    expect(textarea).toBeInTheDocument()

    // ボタン
    expect(screen.getByText('🎲 選ぶ')).toBeInTheDocument()
    expect(screen.getByText('📜 履歴')).toBeInTheDocument()
  })

  it('名前をカンマ区切りで入力して選ぶボタンを押すと、ランダムな名前が表示される', () => {
    render(<App />)

    const textarea = screen.getByPlaceholderText('例: 田中, 山田, 佐藤, 鈴木')
    const drawButton = screen.getByText('🎲 選ぶ')

    // 名前を入力
    fireEvent.change(textarea, '田中, 山田, 佐藤, 鈴木')

    // ボタンをクリック
    fireEvent.click(drawButton)

    // 結果が表示されるのを待つ
    const resultSection = screen.queryByText('選ばれた名前:')
    expect(resultSection).toBeInTheDocument()
  })

  it('入力がない状態で選ぶボタンを押すと、エラーメッセージが表示される', () => {
    render(<App />)

    const drawButton = screen.getByText('🎲 選ぶ')

    // ボタンをクリック（入力なし）
    fireEvent.click(drawButton)

    // エラーメッセージが表示されるのを待つ
    const errorMessage = screen.queryByText('名前が入力されていません')
    expect(errorMessage).toBeInTheDocument()
  })

  it('履歴ボタンを押すと履歴セクションが表示される', () => {
    render(<App />)

    const historyButton = screen.getByText('📜 履歴')
    fireEvent.click(historyButton)

    // 履歴セクションが表示されるのを待つ
    const historySection = screen.queryByText('履歴')
    expect(historySection).toBeInTheDocument()
  })

  it('クリアボタンで選択結果が消える', () => {
    render(<App />)

    const historyButton = screen.getByText('📜 履歴')
    fireEvent.click(historyButton)

    // 「履歴がありません」が表示されるのを待つ
    const noHistory = screen.queryByText('履歴がありません')
    expect(noHistory).toBeInTheDocument()
  })

  it('履歴から名前を選択できる', async () => {
    // localStorageに履歴を保存
    const mockHistory = JSON.stringify([
      { id: '1', name: '田中', timestamp: Date.now(), names: ['田中', '山田', '佐藤', '鈴木'] }
    ])
    const localStorageMock = global.localStorage as any
    localStorageMock.setItem('random-name-picker-history', mockHistory)

    render(<App />)

    const historyButton = screen.getByText('📜 履歴')
    fireEvent.click(historyButton)

    // 履歴が表示されるのを待つ
    const historyItem = screen.queryByText('田中')
    expect(historyItem).toBeInTheDocument()
  })

  it('履歴をクリアできる', async () => {
    // localStorageに履歴を保存
    const mockHistory = JSON.stringify([
      { id: '1', name: '田中', timestamp: Date.now(), names: ['田中', '山田', '佐藤', '鈴木'] }
    ])
    const localStorageMock = global.localStorage as any
    localStorageMock.setItem('random-name-picker-history', mockHistory)

    render(<App />)

    const historyButton = screen.getByText('📜 履歴')
    fireEvent.click(historyButton)

    // クリアボタンをクリック
    const clearButton = screen.getByText('履歴をクリア')
    fireEvent.click(clearButton)

    // 履歴がクリアされたことを確認
    const noHistory = screen.queryByText('履歴がありません')
    expect(noHistory).toBeInTheDocument()
  })

  it('履歴の削除ボタンが機能する', () => {
    // localStorageに履歴を保存
    const mockHistory = JSON.stringify([
      { id: '1', name: '田中', timestamp: Date.now(), names: ['田中', '山田', '佐藤', '鈴木'] },
      { id: '2', name: '山田', timestamp: Date.now(), names: ['田中', '山田', '佐藤', '鈴木'] }
    ])
    const localStorageMock = global.localStorage as any
    localStorageMock.setItem('random-name-picker-history', mockHistory)

    render(<App />)

    const historyButton = screen.getByText('📜 履歴')
    fireEvent.click(historyButton)

    const deleteButtons = screen.getAllByText('✕')
    expect(deleteButtons.length).toBe(2)

    // 1つ目の削除ボタンをクリック
    fireEvent.click(deleteButtons[0])

    const remainingItems = screen.getAllByText('✕')
    expect(remainingItems.length).toBe(1)
  })

  it('クリアボタンで選択結果が消える', () => {
    render(<App />)

    const textarea = screen.getByPlaceholderText('例: 田中, 山田, 佐藤, 鈴木')
    const drawButton = screen.getByText('🎲 選ぶ')

    // 名前を入力して選ぶ
    fireEvent.change(textarea, '田中, 山田')
    fireEvent.click(drawButton)

    const resultSection = screen.queryByText('選ばれた名前:')
    expect(resultSection).toBeInTheDocument()

    // クリアボタンをクリック
    const clearButton = screen.getByText('クリア')
    fireEvent.click(clearButton)

    // 結果が消えることを確認
    const resultSection2 = screen.queryByText('選ばれた名前:')
    const resultName = screen.queryByText('田中')
    expect(resultSection2).not.toBeInTheDocument()
    expect(resultName).not.toBeInTheDocument()
  })
})
