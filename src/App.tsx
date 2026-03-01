import { useState, useEffect } from 'react'
import './App.css'

// 履歴アイテムの型定義（countフィールドを追加）
interface HistoryItem {
  id: string
  name: string
  timestamp: number
  names: string[]
  count: number  // 各名前が出た回数
}

// 履歴の型安全キー
const HISTORY_STORAGE_KEY = 'random-name-picker-history'

// 履歴をロード
const loadHistory = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load history:', error)
    return []
  }
}

// 履歴を保存
const saveHistory = (history: HistoryItem[]) => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save history:', error)
  }
}

// 特定の名前の出た回数を計算する
const countNameOccurrences = (history: HistoryItem[], targetName: string): number => {
  let count = 0
  for (const item of history) {
    for (const name of item.names) {
      if (name === targetName) {
        count++
      }
    }
  }
  return count
}

// 総試行数を計算する
const calculateTotalDraws = (history: HistoryItem[]): number => {
  return history.reduce((total, item) => total + item.names.length, 0)
}

// 確率を計算する補助関数
const calculateNameProbability = (history: HistoryItem[], targetName: string) => {
  const totalDraws = calculateTotalDraws(history)
  const nameOccurrences = countNameOccurrences(history, targetName)
  const percentage = totalDraws > 0 ? Math.round((nameOccurrences / totalDraws) * 100) : 0
  
  return {
    percentage,
    totalDraws,
    nameOccurrences
  }
}

// 入力欄から名前をカンマ区切りで取得
const parseNames = (input: string): string[] => {
  return input.split(',').map(name => name.trim()).filter(name => name.length > 0)
}

// 入力された名前からランダムに1つ選択
const getRandomName = (names: string[]): string | null => {
  if (names.length === 0) return null
  return names[Math.floor(Math.random() * names.length)]
}

function App() {
  const [input, setInput] = useState<string>('')
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState<boolean>(false)

  // コンポーネントマウント時に履歴をロード
  useEffect(() => {
    const loadedHistory = loadHistory()
    setHistory(loadedHistory)
  }, [])

  // 選んだ後に履歴を更新するuseEffect
  useEffect(() => {
    if (selectedName) {
      const existingItem = history.find(item => item.name === selectedName)
      
      if (existingItem) {
        // 既存のアイテムのcountを更新
        const updatedHistory = history.map(item => 
          item.name === selectedName 
            ? { ...item, count: item.count + 1 }
            : item
        )
        setHistory(updatedHistory)
        saveHistory(updatedHistory)
      } else {
        // 新しいアイテムを追加
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          name: selectedName,
          timestamp: Date.now(),
          names: input.split(',').map(n => n.trim()).filter(n => n.length > 0),
          count: 1
        }
        const updatedHistory = [newItem, ...history]
        setHistory(updatedHistory)
        saveHistory(updatedHistory)
      }
    }
  }, [selectedName])

  const handleDraw = () => {
    const names = parseNames(input)
    if (names.length === 0) {
      setSelectedName('名前が入力されていません')
      return
    }

    const winner = getRandomName(names)
    if (winner) {
      setSelectedName(winner)
    }
  }

  const handleClear = () => {
    setSelectedName(null)
  }

  const handleHistoryToggle = () => {
    setShowHistory(!showHistory)
  }

  const handleHistorySelect = (item: HistoryItem) => {
    setSelectedName(item.name)
    setInput(item.names.join(', '))
    setShowHistory(false)
  }

  const handleHistoryDelete = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id)
    setHistory(updatedHistory)
    saveHistory(updatedHistory)
  }

  const handleHistoryClear = () => {
    setHistory([])
    saveHistory([])
    setShowHistory(false)
  }

  // 特定の名前の確率を計算
  const nameProbability = selectedName ? calculateNameProbability(selectedName) : null

  return (
    <>
      <div>
        <h1>ランダム名前選び</h1>

        <div className="input-section">
          <label htmlFor="name-input">
            名前をカンマ区切りで入力してください:
          </label>
          <textarea
            id="name-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="例: 田中, 山田, 佐藤, 鈴木"
            rows={3}
            className="name-input"
          />
        </div>

        <div className="button-group">
          <button onClick={handleDraw} className="draw-button">
            🎲 選ぶ
          </button>
          <button onClick={handleHistoryToggle} className="history-button">
            📜 履歴 {showHistory ? '閉じる' : '開く'}
          </button>
        </div>

        {selectedName && (
          <div className="result-section">
            <h2>選ばれた名前:</h2>
            <p className="result-name">{selectedName}</p>
            
            {/* 確率表示 */}
            {nameProbability && (
              <div className="probability-section">
                <p className="probability-title">📊 確率: {nameProbability.percentage}%</p>
                <p className="probability-detail">
                  過去{calculateTotalDraws(history)}回中で{calculateNameOccurrences(history, selectedName)}回出ています
                  （この名前は選ばれる確率: {nameProbability.percentage}%）
                </p>
              </div>
            )}
            
            <button onClick={handleClear} className="clear-button">
              クリア
            </button>
          </div>
        )}

        {showHistory && (
          <div className="history-section">
            <div className="history-header">
              <h2>履歴</h2>
              <button onClick={handleHistoryClear} className="history-clear-button">
                履歴をクリア
              </button>
            </div>
            <div className="history-list">
              {history.length === 0 ? (
                <p className="no-history">履歴がありません</p>
              ) : (
                history.slice(0, 10).map(item => (
                  <div key={item.id} className="history-item">
                    <div className="history-item-content">
                      <div className="history-item-name">{item.name}</div>
                      <div className="history-item-meta">
                        <span className="history-item-time">
                          {new Date(item.timestamp).toLocaleString('ja-JP')}
                        </span>
                        <span className="history-item-count">
                          出た回数: {item.count}回
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleHistoryDelete(item.id)}
                      className="history-delete-button"
                      title="削除"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
          </label>
          <textarea
            id="name-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="例: 田中, 山田, 佐藤, 鈴木"
            rows={3}
            className="name-input"
          />
        </div>

        <div className="button-group">
          <button onClick={handleDraw} className="draw-button">
            🎲 選ぶ
          </button>
          <button onClick={handleHistoryToggle} className="history-button">
            📜 履歴 {showHistory ? '閉じる' : '開く'}
          </button>
        </div>

        {selectedName && (
          <div className="result-section">
            <h2>選ばれた名前:</h2>
            <p className="result-name">{selectedName}</p>
            
            {/* 確率表示 */}
            {nameProbability && (
              <div className="probability-section">
                <p className="probability-title">📊 確率: {nameProbability.percentage}%</p>
                <p className="probability-detail">
                  過去{calculateTotalDraws(history)}回中で{calculateNameOccurrences(history, selectedName)}回出ています
                  （この名前は選ばれる確率: {nameProbability.percentage}%）
                </p>
              </div>
            )}
            
            <button onClick={handleClear} className="clear-button">
              クリア
            </button>
          </div>
        )}

        {showHistory && (
          <div className="history-section">
            <div className="history-header">
              <h2>履歴</h2>
              <button onClick={handleHistoryClear} className="history-clear-button">
                履歴をクリア
              </button>
            </div>
            <div className="history-list">
              {history.length === 0 ? (
                <p className="no-history">履歴がありません</p>
              ) : (
                history.slice(0, 10).map(item => (
                  <div key={item.id} className="history-item">
                    <div className="history-item-content">
                      <div className="history-item-name">{item.name}</div>
                      <div className="history-item-meta">
                        <span className="history-item-time">
                          {new Date(item.timestamp).toLocaleString('ja-JP')}
                        </span>
                        <span className="history-item-count">
                          出た回数: {item.count}回
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleHistoryDelete(item.id)}
                      className="history-delete-button"
                      title="削除"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default App
