import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'

describe('App', () => {
  beforeEach(() => {
    // 各テスト前に選択結果をリセット
  })

  it('入力欄と選ぶボタンが表示される', () => {
    render(<App />)

    // タイトル
    expect(screen.getByText('ランダム名前選び')).toBeInTheDocument()

    // 入力欄
    const textarea = screen.getByPlaceholderText('例: 田中, 山田, 佐藤, 鈴木')
    expect(textarea).toBeInTheDocument()

    // 選ぶボタン
    const button = screen.getByText('🎲 選ぶ')
    expect(button).toBeInTheDocument()
  })

  it('名前をカンマ区切りで入力して選ぶボタンを押すと、ランダムな名前が表示される', async () => {
    render(<App />)

    const textarea = screen.getByPlaceholderText('例: 田中, 山田, 佐藤, 鈴木')
    const button = screen.getByText('🎲 選ぶ')

    // 名前を入力
    fireEvent.change(textarea, '田中, 山田, 佐藤, 鈴木')

    // ボタンをクリック
    fireEvent.click(button)

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

    const button = screen.getByText('🎲 選ぶ')

    // ボタンをクリック（入力なし）
    fireEvent.click(button)

    // エラーメッセージが表示されるのを待つ
    await waitFor(() => {
      const errorMessage = screen.queryByText('名前が入力されていません')
      expect(errorMessage).toBeInTheDocument()
    })
  })

  it('クリアボタンを押すと、選択結果が消える', async () => {
    render(<App />)

    const textarea = screen.getByPlaceholderText('例: 田中, 山田, 佐藤, 鈴木')
    const button = screen.getByText('🎲 選ぶ')

    // 名前を入力して選ぶ
    fireEvent.change(textarea, '田中, 山田')
    fireEvent.click(button)

    // 結果が表示されるのを待つ
    await waitFor(() => {
      expect(screen.queryByText('選ばれた名前:')).toBeInTheDocument()
    })

    // クリアボタンをクリック
    const clearButton = screen.getByText('クリア')
    fireEvent.click(clearButton)

    // 結果が消えることを確認
    expect(screen.queryByText('選ばれた名前:')).not.toBeInTheDocument()
    expect(screen.queryByText('田中')).not.toBeInTheDocument()
    expect(screen.queryByText('山田')).not.toBeInTheDocument()
  })
})
