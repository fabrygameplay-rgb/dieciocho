document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const img1 = document.getElementById("img1");
    const img2 = document.getElementById("img2");

    const btnPlayer = document.getElementById("btnPlayer");
    const btnWhiteIA = document.getElementById("btnWhiteIA");
    const btnBlackIA = document.getElementById("btnBlackIA");
    const btnBackground = document.getElementById("btnBackground");
    const letters = document.getElementById("letters");
    const numbers = document.getElementById("numbers");


    const backgrounds = [
            "FotosMango/background.jpg",
            "FotosMango/background2.jpg",
            "FotosMango/background3.jpg"
    ];
    
    let backgroundActive = false;

if (btnBackground) {
    btnBackground.addEventListener("click", () => {

        backgroundActive = !backgroundActive;

            if (backgroundActive) {
                document.body.style.backgroundImage = 'url("FotosMango/background.jpg")';
                letters.style.color = "snow";
                numbers.style.color = "snow";
            } else {
                document.body.style.backgroundImage = "none";
                letters.style.color = "black";
                numbers.style.color = "black";
            }

        });
    }

    let vsIA = false;
    let humanColor = "blanco";
    let boardOrientation = "whiteBottom";
    let currentDifficulty = "easy";

    if(btnPlayer){
    btnPlayer.addEventListener("click", () => {
        vsIA = false;
        currentBoard = whiteBottom.map(r => [...r]);
        currentTurn = "blanco";
        selectedPiece = null;
        selectedRow = null;
        selectedCol = null;
        for(let k in movedPieces) movedPieces[k] = false;
        renderBoard();
    });
    }

    if(btnWhiteIA){
    btnWhiteIA.addEventListener("click", () => {

        vsIA = true;
        humanColor = "blanco";

        currentBoard = whiteBottom.map(r => [...r]);
        currentTurn = "blanco";

        selectedPiece = null;
        selectedRow = null;
        selectedCol = null;

        for(let k in movedPieces) movedPieces[k] = false;

        renderBoard();
    });
    }

    if(btnBlackIA){
    btnBlackIA.addEventListener("click", () => {

        vsIA = true;
        humanColor = "negro";

        currentBoard = whiteBottom.map(r => [...r]);
        currentTurn = "blanco";

        selectedPiece = null;
        selectedRow = null;
        selectedCol = null;

        for(let k in movedPieces) movedPieces[k] = false;

        renderBoard();

        setTimeout(makeAIMove, 300);
    });
    }

    let selectedPiece = null;
    let selectedRow = null;
    let selectedCol = null;
    let currentTurn = "blanco";
    let stats = {
        easy: { wins: 0, losses: 0 },
        normal: {wins: 0, losses: 0},
        hard: {wins: 0, losses: 0}
    };

    const difficultyButtons = document.querySelectorAll(".difContainer button");

        difficultyButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                currentDifficulty = btn.textContent.toLowerCase();
                alert("Difficulty: " + currentDifficulty.toUpperCase());
            });
        });

    const whiteBottom = [
        ["Torre negra","Caballo negro","Alfil negro","Reina negra","Rey negro","Alfil negro","Caballo negro","Torre negra"],
        ["Peón negro","Peón negro","Peón negro","Peón negro","Peón negro","Peón negro","Peón negro","Peón negro"],
        [null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null],
        ["Peón blanco","Peón blanco","Peón blanco","Peón blanco","Peón blanco","Peón blanco","Peón blanco","Peón blanco"],
        ["Torre blanca","Caballo blanco","Alfil blanco","Reina blanca","Rey blanco","Alfil blanco","Caballo blanco","Torre blanca"]
    ];

    const blackBottom = [
        ["Torre blanca","Caballo blanco","Alfil blanco","Reina blanca","Rey blanco","Alfil blanco","Caballo blanco","Torre blanca"],
        ["Peón blanco","Peón blanco","Peón blanco","Peón blanco","Peón blanco","Peón blanco","Peón blanco","Peón blanco"],
        [null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null],
        ["Peón negro","Peón negro","Peón negro","Peón negro","Peón negro","Peón negro","Peón negro","Peón negro"],
        ["Torre negra","Caballo negro","Alfil negro","Reina negra","Rey negro","Alfil negro","Caballo negro","Torre negra"]
    ];

    let currentBoard = Array(8).fill(null).map(()=>Array(8).fill(null));

    const movedPieces = {
        "Rey blanco": false,
        "Rey negro": false,
        "Torre blanca_0": false,
        "Torre blanca_7": false,
        "Torre negra_0": false,
        "Torre negra_7": false
    };

    function renderBoard(){
        board.innerHTML = "";
        for(let r=0; r<8; r++){
            const row = boardOrientation === "whiteBottom" ? r : 7 - r;
            const rowDiv = document.createElement("div");
            rowDiv.style.display = "flex";

            for(let c=0; c<8; c++){
                const col = boardOrientation === "whiteBottom" ? c : 7 - c;
                const creamBox = document.createElement("div");
                creamBox.classList.add("creamBox");
                creamBox.style.backgroundColor = (row+col)%2===0?"snow":"tan";

                if(selectedRow===row && selectedCol===col) creamBox.style.backgroundColor="yellow";

                creamBox.addEventListener("click",()=>handleClick(row,col));

                const pieceName = currentBoard[row][col];
                if(pieceName){
                    const img = document.createElement("img");
                    img.src = `FotosMango/${pieceName}.png`;
                    img.alt = pieceName;
                    creamBox.appendChild(img);
                }
                rowDiv.appendChild(creamBox);
            }
            board.appendChild(rowDiv);
        }
    }

    function updateScoreDisplay(){

        const difficultyBoxes = document.querySelectorAll(".difficulty");

            difficultyBoxes.forEach(box => {
                const level = box.querySelector("button").textContent.toLowerCase();
                const spans = box.querySelectorAll("span");

                spans[0].textContent = stats[level].wins;
                spans[1].textContent = stats[level].losses;
            });
        }

    function handleClick(row,col){
        const piece = currentBoard[row][col];

        if(selectedPiece!==null){
            const validMoves = getValidMoves(selectedPiece,selectedRow,selectedCol);
            const isValidMove = validMoves.some(([r,c])=>r===row && c===col);

            if(piece && ((currentTurn==="blanco" && (piece.includes("blanco")||piece.includes("blanca"))) ||
                         (currentTurn==="negro" && (piece.includes("negro")||piece.includes("negra"))))){
                selectedPiece = piece;
                selectedRow = row;
                selectedCol = col;
                renderBoard();
                return;
            }

            if(!isValidMove){
                selectedPiece = null;
                selectedRow = null;
                selectedCol = null;
                renderBoard();
                return;
            }

            if(vsIA && currentTurn !== humanColor) return;

            if(selectedPiece.toLowerCase().includes("rey") && Math.abs(col-selectedCol)===2){
                if(col-selectedCol>0){
                    currentBoard[row][col-1] = currentBoard[row][7];
                    currentBoard[row][7] = null;
                    movedPieces[`${currentBoard[row][col-1]}_7`] = true;
                } else {
                    currentBoard[row][col+1] = currentBoard[row][0];
                    currentBoard[row][0] = null;
                    movedPieces[`${currentBoard[row][col+1]}_0`] = true;
                }
            }

            if(currentBoard[row][col]?.toLowerCase().includes("rey")){

                alert(`¡Fin de partida! ${currentTurn} gana`);
                if(vsIA){
                    if(currentTurn === humanColor){
                        stats[currentDifficulty].wins++;
                    } else {
                        stats[currentDifficulty].losses++;
                    }

                    updateScoreDisplay();
                }

                currentBoard = whiteBottom.map(r=>[...r]);
                currentTurn="blanco";
                selectedPiece=null; selectedRow=null; selectedCol=null;
                for(let k in movedPieces) movedPieces[k]=false;
                renderBoard();
                return;
            }

            currentBoard[row][col] = selectedPiece;
            currentBoard[selectedRow][selectedCol] = null;

            if(selectedPiece.includes("Rey")) movedPieces[selectedPiece]=true;
            if(selectedPiece.includes("Torre")) movedPieces[`${selectedPiece}_${selectedCol}`]=true;

            if(selectedPiece.toLowerCase().includes("peón") && (row===0 || row===7)){

        const color = (selectedPiece.includes("blanco") || selectedPiece.includes("blanca")) ? "blanca" : "negra";

        const overlay = document.createElement("div");
        overlay.id="promotionOverlay";
        overlay.style.position="absolute";
        overlay.style.top="0";
        overlay.style.left="0";
        overlay.style.width="100%";
        overlay.style.height="100%";
        overlay.style.backgroundColor="rgba(0,0,0,0.7)";
        overlay.style.display="flex";
        overlay.style.justifyContent="center";
        overlay.style.alignItems="center";
        overlay.style.zIndex="1000";

        const menu = document.createElement("div");
        menu.style.backgroundColor="white";
        menu.style.padding="10px";
        menu.style.borderRadius="8px";
        menu.style.display="flex";
        menu.style.gap="10px";

    ["Reina","Torre","Alfil","Caballo"].forEach(p=>{
        let pieceColor;
        if(p === "Reina" || p === "Torre"){
        // femme
        pieceColor = (selectedPiece.includes("blanco") || selectedPiece.includes("blanca")) ? "blanca" : "negra";
    } else {
        // masc
        pieceColor = (selectedPiece.includes("blanco") || selectedPiece.includes("blanca")) ? "blanco" : "negro";
    }

        const btn = document.createElement("button");
        btn.textContent = `${p} ${pieceColor}`;
        btn.style.padding="10px";
        btn.style.cursor="pointer";
        btn.addEventListener("click",()=>{
            currentBoard[row][col] = `${p} ${pieceColor}`;

            selectedPiece = null;
            selectedRow = null;
            selectedCol = null;

            currentTurn = currentTurn==="blanco"?"negro":"blanco";

            document.body.removeChild(overlay);
            renderBoard();

            if(vsIA && currentTurn !== humanColor){
                setTimeout(makeAIMove, 300);
            }
        });


            menu.appendChild(btn);
        });

            overlay.appendChild(menu);
            document.body.appendChild(overlay);
            return;
        }

            currentTurn = currentTurn==="blanco"?"negro":"blanco";
            renderBoard();

        if(vsIA && currentTurn !== humanColor){
            setTimeout(makeAIMove, 300);
        }

            return;

        }

        if(piece && ((currentTurn==="blanco" && (piece.includes("blanco")||piece.includes("blanca"))) ||
                     (currentTurn==="negro" && (piece.includes("negro")||piece.includes("negra"))))){
            selectedPiece = piece;
            selectedRow = row;
            selectedCol = col;
            renderBoard();
        }
    }

    document.addEventListener("keydown",e=>{
        if(e.key==="Escape"){ selectedPiece=null; selectedRow=null; selectedCol=null; renderBoard(); }
    });

    img1.addEventListener("click", e => {
        e.preventDefault();
        boardOrientation = "whiteBottom";
        renderBoard();
    });

    img2.addEventListener("click", e => {
        e.preventDefault();
        boardOrientation = "blackBottom";
        renderBoard();
    });

    function getValidMoves(piece,row,col){
    const moves = [];
    const isWhite = piece.includes("blanco")||piece.includes("blanca");
    const isBlack = piece.includes("negro")||piece.includes("negra");

    const enemyCheck = t=>{
        if(!t) return true;
        if(isWhite) return !(t.includes("blanco")||t.includes("blanca"));
        if(isBlack) return !(t.includes("negro")||t.includes("negra"));
    }

    // rook
    if(piece.toLowerCase().includes("torre")){
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{
            let r=row+dr, c=col+dc;
            while(r>=0 && r<8 && c>=0 && c<8){
                if(!enemyCheck(currentBoard[r][c])) break;
                moves.push([r,c]);
                if(currentBoard[r][c]) break;
                r+=dr; c+=dc;
            }
        });
    }

    // bishop
    if(piece.toLowerCase().includes("alfil")){
        [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>{
            let r=row+dr, c=col+dc;
            while(r>=0 && r<8 && c>=0 && c<8){
                if(!enemyCheck(currentBoard[r][c])) break;
                moves.push([r,c]);
                if(currentBoard[r][c]) break;
                r+=dr; c+=dc;
            }
        });
    }

    // queen
    if(piece.toLowerCase().includes("reina")){
        [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>{
            let r=row+dr, c=col+dc;
            while(r>=0 && r<8 && c>=0 && c<8){
                if(!enemyCheck(currentBoard[r][c])) break;
                moves.push([r,c]);
                if(currentBoard[r][c]) break;
                r+=dr; c+=dc;
            }
        });
    }

    // horse
    if(piece.toLowerCase().includes("caballo")){
        [[2,1],[1,2],[2,-1],[1,-2],[-2,1],[-1,2],[-2,-1],[-1,-2]].forEach(([dr,dc])=>{
            let r=row+dr, c=col+dc;
            if(r>=0 && r<8 && c>=0 && c<8 && enemyCheck(currentBoard[r][c])) moves.push([r,c]);
        });
    }

    // king
    if(piece.toLowerCase().includes("rey")){
        [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>{
            let r=row+dr, c=col+dc;
            if(r>=0 && r<8 && c>=0 && c<8 && enemyCheck(currentBoard[r][c])) moves.push([r,c]);
        });

    // castling
    if(!movedPieces[piece]){
        if(!currentBoard[row][col+1] && !currentBoard[row][col+2]){
            const rook = currentBoard[row][7];
                if(rook && rook.includes("Torre") && !movedPieces[`${rook}_7`]) moves.push([row,col+2]);
            }
        if(!currentBoard[row][col-1] && !currentBoard[row][col-2] && !currentBoard[row][col-3]){
            const rook = currentBoard[row][0];
                if(rook && rook.includes("Torre") && !movedPieces[`${rook}_0`]) moves.push([row,col-2]);
            }
        }
    }

        // pawn
        if(piece.toLowerCase().includes("peón")){
            const isWhiteAtBottom = currentBoard[7].some(p => p?.includes("blanco") || p?.includes("blanca"));
            const dir = isWhite ? (isWhiteAtBottom ? -1 : 1) : (isWhiteAtBottom ? 1 : -1);
            const startRow = isWhite ? (isWhiteAtBottom ? 6 : 1) : (isWhiteAtBottom ? 1 : 6);

            if(row+dir >= 0 && row+dir < 8 && !currentBoard[row+dir][col]) moves.push([row+dir, col]);

            if(row === startRow && !currentBoard[row+dir][col] && !currentBoard[row+dir*2][col]) moves.push([row+dir*2, col]);

            [-1, 1].forEach(dc=>{
                const r = row+dir, c = col+dc;
                if(r >= 0 && r < 8 && c >= 0 && c < 8){
                    const t = currentBoard[r][c];
                    if(t && !((isWhite && (t.includes("blanco")||t.includes("blanca"))) ||
                            (isBlack && (t.includes("negro")||t.includes("negra"))))) moves.push([r, c]);
                }
            });
        }

    return moves;
}

        function makeAIMove() {

            let allMoves = [];
            const aiColor = humanColor === "blanco" ? "negro" : "blanco";

            for(let row = 0; row < 8; row++) {
             for(let col = 0; col < 8; col++) {

                const piece = currentBoard[row][col];

                if(piece && (
                    (aiColor === "blanco" && (piece.includes("blanco") || piece.includes("blanca"))) ||
                    (aiColor === "negro" && (piece.includes("negro") || piece.includes("negra")))
                )) {

                    const moves = getValidMoves(piece, row, col);

                    moves.forEach(([r, c]) => {
                        allMoves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: r,
                            toCol: c,
                            piece: piece
                        });
                    });
                }
        }

        }

        if(allMoves.length === 0) return;

        let chosenMove;

        if(currentDifficulty === "easy"){

            chosenMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        }

        else if(currentDifficulty === "normal"){

            const captureMoves = allMoves.filter(m => currentBoard[m.toRow][m.toCol] !== null);
            chosenMove = captureMoves.length > 0
                ? captureMoves[Math.floor(Math.random() * captureMoves.length)]
                : allMoves[Math.floor(Math.random() * allMoves.length)];
        }

        else if(currentDifficulty === "hard"){

            const kingCapture = allMoves.find(m =>
                currentBoard[m.toRow][m.toCol]?.toLowerCase().includes("rey")
            );

            if(kingCapture){
                chosenMove = kingCapture;
            } else {
                const captureMoves = allMoves.filter(m => currentBoard[m.toRow][m.toCol] !== null);
                chosenMove = captureMoves.length > 0
                    ? captureMoves[Math.floor(Math.random() * captureMoves.length)]
                    : allMoves[Math.floor(Math.random() * allMoves.length)];
            }
        }

    const targetPiece = currentBoard[chosenMove.toRow][chosenMove.toCol];

        if(targetPiece?.toLowerCase().includes("rey")){

            alert("¡Fin de partida! IA gana");

            if(vsIA){
                stats[currentDifficulty].losses++;
                updateScoreDisplay();
            }

            currentBoard = whiteBottom.map(r=>[...r]);
            currentTurn = "blanco";
            selectedPiece = null;
            selectedRow = null;
            selectedCol = null;

            for(let k in movedPieces) movedPieces[k] = false;

            renderBoard();
            return;
        }

        currentBoard[chosenMove.toRow][chosenMove.toCol] = chosenMove.piece;
        currentBoard[chosenMove.fromRow][chosenMove.fromCol] = null;

    currentTurn = currentTurn === "blanco" ? "negro" : "blanco";

    renderBoard();

    if(vsIA && currentTurn !== humanColor){
        setTimeout(makeAIMove, 300);
    }
}
    updateScoreDisplay();
    renderBoard();

});