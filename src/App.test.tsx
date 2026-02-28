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

  it('名前をカンマ区切りで入力して選ぶボタンを押すと、ランダムな名前が表示される', async () => {
    render(<App />)

    const textarea = screen.getByPlaceholderText('例: 田中, 山田, 佐藤, 鈴木')
    const drawButton = screen.getByText('🎲 選ぶ')

    // 名前を入力
    fireEvent.change(textarea, '田中, 山田, 佐藤, 鈴木')
    fireEvent.click(drawButton)

    // 結果が表示されるのを待つ
    await waitFor(() => {
      const resultSection = screen.queryByText('選ばれた名前:')
      expect(resultSection).toBeInTheDocument()
    })

    // 選ばれた名前がいずれかの名前であることを確認
    const resultName = screen.queryByText(/^(田中|山田|佐藤|鈴木)$/)
    expect(resultName).toBeInTheDocument()
  })

  it('入力がない状態で選ぶボタンを押すと、エラーメッセージが表示される', async () => {
    render(<App />)

    const drawButton = screen.getByText('🎲 選ぶ')

    // ボタンをクリック（入力なし）
    fireEvent.click(drawButton)

    // エラーメッセージが表示されるのを待つ
    await waitFor(() => {
      const errorMessage = screen.queryByText('名前が入力されていません')
      expect(errorMessage).toBeInTheDocument()
    })
  })

  it('履歴ボタンを押すと履歴セクションが表示される', async () => {
    render(<App />)

    const historyButton = screen.getByText('📜 履歴')
    fireEvent.click(historyButton)

    // 履歴セクションが表示されるのを待つ
    await waitFor(() => {
      expect(screen.queryByText('履歴')).toBeInTheDocument()
    })
  })

  it('履歴がない状態では「履歴がありません」が表示される', async () => {
    render(<App />)

    const historyButton = screen.getByText('📜 履歴')
    fireEvent.click(historyButton)

    // 「履歴がありません」が表示されるのを待つ
    await waitFor(() => {
      const noHistory = screen.queryByText('履歴がありません')
      expect(noHistory).toBeInTheDocument()
    })
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

    await waitFor(() => {
      // 履歴が表示されるのを待つ
      const historyItem = screen.queryByText('田中')
      expect(historyItem).toBeInTheDocument()
    })

    // 履歴アイテムをクリックして再選択
    const reselectButton = screen.getByText('↩')
    fireEvent.click(reselectButton)

    await waitFor(() => {
      // 入力欄に履歴の名前が設定されたことを確認
      const textarea = screen.getByPlaceholderText('例: 田中, 山田, 佐藤, 鈴木')
      expect(textarea.value).toBe('田中, 山田, 佐藤, 鈴木')
    })
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

    await waitFor(() => {
      // 履歴がクリアされたことを確認
      const noHistory = screen.queryByText('履歴がありません')
      expect(noHistory).toBeInTheDocument()
    })
  })

  it('履歴の削除ボタンが機能する', async () => {
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

    await waitFor(() => {
      // 最初の削除ボタンを探す
      const deleteButtons = screen.getAllByText('✕')
      expect(deleteButtons.length).toBe(2)

      // 1つ目の削除ボタンをクリック
      fireEvent.click(deleteButtons[0])

      await waitFor(() => {
        const remainingItems = screen.getAllByText('✕')
        expect(remainingItems.length).toBe(1)
      })
    })
  })

  it('クリアボタンで選択結果が消える', async () => {
    render(<App />)

    const textarea = screen.getByPlaceholderText('例: 田中, 山田, 佐藤, 鈴木')
    const drawButton = screen.getByText('🎲 選ぶ')

    // 名前を入力して選ぶ
    fireEvent.change(textarea, '田中, 山田')
    fireEvent.click(drawButton)

    // 結果が表示されるのを待つ
    await waitFor(() => {
      expect(screen.queryByText('選ばれた名前:')).toBeInTheDocument()
    })

    // クリアボタンをクリック
    const clearButton = screen.getByText('クリア')
    fireEvent.click(clearButton)

    // 結果が消えることを確認
    await waitFor(() => {
      expect(screen.queryByText('選ばれた名前:')).not.toBeInTheDocument()
      expect(screen.queryByText('田中')).not.toBeInTheDocument()
    })
  })
})
