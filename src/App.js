  import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
const PLAYER_1 = "red";
const PLAYER_2 = "green";
function Square(props){
  let cl = "square";
  if(props.selected){
    cl += " selected";
  }
  if(props.value){
    cl += " " + props.value;
  }
    return (
      <button key={"cell"+props.keyp} onClick={props.click} className={cl}>
      </button>
    );
}

class Board extends Component{
  constructor(props){
    super(props);

    let sq = Array(this.props.rows).fill(1);
    sq.forEach((e,i) =>{
      e = Array(this.props.cols).fill(null);
      sq[i] = e;
    });
    sq[0][0] = PLAYER_1;
    sq[0][this.props.cols-1] = PLAYER_2;
    sq[this.props.rows-1][this.props.cols-1] = PLAYER_1;
    sq[this.props.rows-1][0] = PLAYER_2;

    this.state = {
      squares:sq,
      xIsNext: true,
      currentPlayer: PLAYER_1,
      selected: null,
      gameOver : false,
      score: {x:2,o:2,winner:"TIE"}
    };
  }
  renderSquare(r,c, selected){
    return <Square selected={selected} key={"square"+r*c+c} keyp={r*c+c} value={this.state.squares[r][c] } click={()=>this.handleClick(r,c)} />;
  }
  distance(a,b){
    let dx = b.c-a.c;
    let dy = b.r-a.r;
    return Math.sqrt(dx*dx+dy*dy);
  }
  renderRow(r){
    let cols = [];
    for(let c = 0; c<this.props.cols;c++){
    let selected = false;

      if(this.state.selected){
        if(this.state.selected.r === r && this.state.selected.c === c){
          selected = true;
        } 
      }
      cols.push(this.renderSquare(r,c, selected));
    }
    return (
      <div key={"row"+r} className="board-row">
        {cols}
      </div>
    );
  }
  findNeighbours(r,c){
    let neighbours = [];
    for(let ri = r-1;ri<r+2;ri++){
      for(let ci = c-1;ci<c+2;ci++){
        neighbours.push({r:ri, c:ci});
      }
    }
    return neighbours;
  }
  getMoves(player, squares){
    let free = [];
    let players = [];
    let possible = [];
    squares.forEach((row,r)=>{
      row.forEach((col,c)=>{
        if(!col){
          free.push({r:r, c:c});
        } else if(col === player){
          players.push({r:r, c:c});
        }
      });
    });
    free.forEach((c) => {
      players.forEach(p => {
        if(this.distance(c,p) <= 2){
          possible.push(c);
        }
      });
    });
    return { free: free, owned: players, possible: possible};
  }
  cannotMove(player,squares){
    let moves = this.getMoves(player, squares);
    if(moves.players === 0 || moves.free === 0){
      return true;
    }
    return moves.possible.length === 0;
  }
  weHaveAWinner(squares){
    return this.cannotMove(PLAYER_1,squares) && this.cannotMove(PLAYER_2,squares);
  }

  score(squares){
    let score = { x:0, o:0 , winner: null};
    squares.forEach(row => {
      row.forEach(col => {
        if(col === PLAYER_1){
          score.x += 1;
        }
        if(col === PLAYER_2){
          score.o += 1;
        }
      });
    });
    if(score.x > score.o){
      score.winner = PLAYER_1;
    } else if(score.x < score.o){
      score.winner = PLAYER_2;
    } else {
      score.winner = "TIE";
    }
    return score;    
  }
  handleClick(r,c){
    const squares = this.state.squares.slice();
    const row = squares[r].slice();
    const cell = row[c];
    if(!squares[r]){
      return;
    }
    if(!this.state.selected){
      if(!cell){
        return;
      }
      if(cell !== this.state.currentPlayer){
        return;
      }
      this.setState({selected: {r:r, c:c}});
      return;
    }
    const dist = Math.floor(this.distance(this.state.selected, {r:r, c:c}));
    if(dist > 2){
      return;
    }
    if(row[c] !== null){
      return;
    }

    const neighbours = this.findNeighbours(r,c);
    row[c] = this.state.currentPlayer;
    squares[r] = row;
    if(dist === 2){
      const selrow = squares[this.state.selected.r].slice();
      selrow[this.state.selected.c] = null;
      squares[this.state.selected.r] = selrow;
    }
    
    neighbours.forEach(neighbour => {
      if(!squares[neighbour.r]){
        return;
      }
      const nrow = squares[neighbour.r].slice();
      
      if(nrow[neighbour.c] && nrow[neighbour.c] !== row[c]){
        nrow[neighbour.c] = row[c];
      }
      squares[neighbour.r] = nrow;
    });
    let nextPlayer = this.state.currentPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1;
    if(this.cannotMove(nextPlayer, squares)){
      nextPlayer = this.state.currentPlayer;
    } 
    let score = this.score(squares);
    console.log(score);
    if(this.weHaveAWinner(squares)){
      this.setState({gameOver: true, score: score});
    }
    this.setState({squares: squares, currentPlayer: nextPlayer, selected: null, score: score});
  }
  render(){
    const status = "Next Player: "+(this.state.xIsNext ? PLAYER_1 : PLAYER_2);
    return (
      <div>
        <div className="status">{status}</div>
        {Array(this.props.rows).fill(null).map((_,i)=>{
          return this.renderRow(i);
        })}

        <h2>Winning: {this.state.score.winner}</h2>
        <table>
          <thead>
        <tr>
          <th>
            Player
          </th>
          <th> Score</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>{PLAYER_1}</td>
            <td>{this.state.score.x}</td>
            </tr>
          <tr>
            <td>{PLAYER_2}</td>
            <td>{this.state.score.o}</td>
            </tr>
            </tbody>
            </table>
    </div>
    );
  }
}
class Game extends Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board rows={7} cols={7}/>
        </div>
      </div>
    );
  }
}

export default Game;
