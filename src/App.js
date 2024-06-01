import { useState } from "react"; // ReactからuseStateフックをインポート

// Gameコンポーネント
export default function Game() {
  // ゲームの履歴を保存する状態を定義。初期状態は9つのnull値を持つ配列。
  const [history, setHistory] = useState([Array(9).fill(null)]);
  // 現在のムーブ(手数)を保存する状態を定義。初期状態は0。
  const [currentMove, setCurrentMove] = useState(0);
  // 昇順/降順をトグルする状態を定義。初期状態はtrue（昇順）。
  const [isAscending, setIsAscending] = useState(true);
  // 次のプレイヤーがXかOかを決定。偶数ならX、奇数ならO。
  const xIsNext = currentMove % 2 === 0;
  // 現在の盤面の状態を取得
  const currentSquares = history[currentMove];

  // プレイが行われたときに呼ばれる関数
  function handlePlay(nextSquares) {
    // 現在のムーブまでの履歴を取得し、新しいムーブを追加
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    // 履歴を更新
    setHistory(nextHistory);
    // 現在のムーブを更新
    setCurrentMove(nextHistory.length - 1);
  }

  // 指定されたムーブにジャンプする関数
  function jumpTo(nextMove) {
    // 現在のムーブを更新
    setCurrentMove(nextMove);
  }

  // 昇順/降順をトグルする関数
  function toggleSortOrder() {
    setIsAscending(!isAscending);
  }

  // 各ムーブへのジャンプボタンを生成
  const moves = history.map((_squares, move) => {
    const description = move > 0 ? "Go to move #" + move : "Go to game start";

    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  // ムーブリストをソート
  if (!isAscending) {
    moves.reverse();
  }

  // ゲームの盤面とムーブリストをレンダリング
  return (
    <div className="game">
      <div className="game-board">
        {/* Boardコンポーネントをレンダリング */}
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <button onClick={toggleSortOrder}>
          {isAscending ? "Sort Descending" : "Sort Ascending"}
        </button>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

// Boardコンポーネント
function Board({ xIsNext, squares, onPlay }) {
  // セルがクリックされたときのハンドラー
  function handleClick(i) {
    // すでにクリックされているか勝者がいる場合は無視
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    // squares配列のコピーを作成
    const nextSquares = squares.slice();
    // 現在のプレイヤーを設定
    nextSquares[i] = xIsNext ? "X" : "O";
    // 新しい盤面を渡してonPlay関数を呼び出し
    onPlay(nextSquares);
  }

  // 勝者を計算
  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo ? winnerInfo.winner : null;
  const winningSquares = winnerInfo ? winnerInfo.line : [];

  // 引き分けの判定
  const isDraw = !winner && squares.every((square) => square !== null);

  // ステータスを設定
  const status = winner
    ? "Winner: " + winner
    : isDraw
    ? "Draw"
    : "Next player: " + (xIsNext ? "X" : "O");

  // 盤面をレンダリング
  return (
    <>
      <div className="status">{status}</div>
      {
        // 2重ループを使用してボードを動的にレンダリング
        Array(3)
          .fill(null)
          .map((_, rowIndex) => (
            <div key={rowIndex} className="board-row">
              {Array(3)
                .fill(null)
                .map((_, colIndex) => {
                  const index = rowIndex * 3 + colIndex;
                  return (
                    <Square
                      key={index}
                      value={squares[index]}
                      onSquareClick={() => handleClick(index)}
                      highlight={winningSquares.includes(index)}
                    />
                  );
                })}
            </div>
          ))
      }
    </>
  );
}

// 勝者を計算する関数
function calculateWinner(squares) {
  // 勝利条件を表す配列
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  // 各勝利条件をチェック
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
}

// Squareコンポーネント
function Square({ value, onSquareClick, highlight }) {
  return (
    <button
      className={`square ${highlight ? "highlight" : ""}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}
