import { useState } from 'react'
import './App.css'

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

  const handleDraw = () => {
    const names = parseNames(input)
    const winner = getRandomName(names)
    setSelectedName(winner || '名前が入力されていません')
  }

  const handleClear = () => {
    setSelectedName(null)
  }

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

        <button onClick={handleDraw} className="draw-button">
          🎲 選ぶ
        </button>

        {selectedName && (
          <div className="result-section">
            <h2>選ばれた名前:</h2>
            <p className="result-name">{selectedName}</p>
            <button onClick={handleClear} className="clear-button">
              クリア
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default App
