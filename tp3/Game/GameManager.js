import { XMLscene } from "../Scene/XMLscene.js";
import { MyBoard } from "../Board/MyBoard.js";
import { MyPiece } from "../Board/MyPiece.js";
import { MyTile } from "../Board/MyTile.js";

/**
 * GameManager class, manages the game state and handles user input.
 */
export class GameManager {
    /**
     * @constructor
     * @param {XMLscene} scene - The application's scene
     * @param {MyBoard} board - The board the game is played in
     */
    constructor(scene, board){
        this.scene = scene;
        this.board = board;
        this.boardDimensions = this.board.getBoardDimensions();
    }

    /**
     * @method initGame Initializes the GameManager object, setting its fields to their defaults, and generating the board pieces
     */
    initGame(){
        console.warn("TODO: implement restarting game from buttonPrompt (GameManager's clear method)");
        // this.board.clear()
        this.turnPlayer = 0; // 0 - white, 1 - black
        this.selectedTileID = 0; // 0 - unselected, (1 to boardDimensions - 1) - selected tile with that id
        console.warn("TODO: implement scoring and capturing pieces");
        this.player0Pit = [];
        this.player1Pit = [];
        this.piecesInPlay = [];
        this.availableMoves = [];

        const p0Appearance = this.board.getAppearanceW();
        const p1Appearance = this.board.getAppearanceB();
        const tiles = this.board.getTiles();
        const rowsToSpawn = 3;
        
        for(let row = 0; row < rowsToSpawn; row++){
            console.warn("TODO: improve the piece creation algorithm");
            // player 0
            for(const tile of tiles[row]){
                if((tile.getID() + row % 2) % 2 == 1){
                    var newPiece = new MyPiece(this.scene, this.boardDimensions, 0, p0Appearance);
                    this.piecesInPlay.push(newPiece);
                    tile.setPiece(newPiece);
                }
            }

            // player 1
            for(const tile of tiles[tiles.length - row - 1]){
                if((tile.getID() - 1 + row % 2) % 2 == 1){
                    var newPiece = new MyPiece(this.scene, this.boardDimensions, 1, p1Appearance);
                    this.piecesInPlay.push(newPiece);
                    tile.setPiece(newPiece);
                }
            }
        }
    }

    /**
     * @method handlePick Method called from the scene when a tile or piece is picked. Depending on the game state, either allows selecting a piece to move, or the movement location
     * @param {Number} tileID id of the picked object
     */
    handlePick(tileID){
        const tileObj = this.board.getTileAt(tileID);

        // tile not yet selected (tile ids are in range [1, boardDimensions^2])
        if(this.selectedTileID === 0){
            // check for a piece on the selected tile
            if(tileObj.getPiece() === null){
                console.log("no piece on this tile");
                return;
            }

            if(tileObj.getPiece().getPlayer() !== this.turnPlayer){
                console.log("that piece does not belong to the current turn player");
                return;
            }

            this.selectedTileID = tileID;
            this.availableMoves = this.getValidMoves(tileID);
            this.resetHighlighting();
        }
        // initial tile selected
        else{
            // check if the tile selected corresponds to one of the possible moves
            if(!this.availableMoves.includes(tileID)){
                console.log("that's not one of the available moves");
                return;
            }


            if(tileID === this.selectedTileID){
                console.log("desselecting selected tile");
                this.selectedTileID = 0;
                this.resetHighlighting();
                return;
            }

            this.move(tileObj);
            this.selectedTileID = 0; // reset selected tile
            this.resetHighlighting()
            this.turnPlayer = (this.turnPlayer + 1) % 2; // change turn player
        }
    }

    /**
     * @method getValidMoves Calculates possible moves from the tileID sent as a parameter
     * @param {Number} tileID id of the tile the moves are calculated from
     * @returns The moves the player can make from the tile with ID tileID
     */
    getValidMoves(tileID){
        console.warn("TODO: allow moving over pieces (and make it the only option)");

        // initialize the array with the tileID to allow for desselecting this tile later
        let possibleMoves = [tileID];

        // player 1 moves to a lower row, player 0 to an upper row
        const rowOffset = ((this.turnPlayer === 1) ? -1 : 1) * this.boardDimensions;
        if(tileID % this.boardDimensions !== 0){
            // can move right
            const move = tileID + rowOffset + 1;
            if(move >= 1 && move <= Math.pow(this.boardDimensions, 2))
                if(this.board.getTileAt(move).getPiece() === null)
                    possibleMoves.push(move);
        }
        if(tileID % this.boardDimensions !== 1){
            // can move left
            const move = tileID + rowOffset - 1;
            if(move >= 1 && move <= Math.pow(this.boardDimensions, 2))
                if(this.board.getTileAt(move).getPiece() === null)
                    possibleMoves.push(move);
        }

        return possibleMoves;
    }

    /**
     * @method move moves a piece from the selectedTileID field into the tile passed as a parameter
     * @param {MyTile} newTile target tile of the movement
     */
    move(newTile){
        const oldTile = this.board.getTileAt(this.selectedTileID);
        const piece = oldTile.getPiece();

        oldTile.setPiece(null);
        newTile.setPiece(piece);
    }

    /**
     * @method resetHighlighting resets the highlighting applied to tiles the player may interact with
     */
    resetHighlighting(){
        for(const tileID of this.availableMoves)
            this.board.toggleHighlight(tileID);
    }

    /**
     * @method updateShaders updates the shaders of the board, by passing the new timefactor to be set into the board's method
     * @param {Number} currTimeFactor - new value for the shader's timefactor
     */
    updateShaders(currTimeFactor){
        const tileIDs = this.availableMoves;
        this.board.updateShaders(tileIDs, currTimeFactor);
    }
}