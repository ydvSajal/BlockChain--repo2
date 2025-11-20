// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title NumberPredictionGame
 * @dev A dice game where players predict a number (1-6) and win 6x their bet if correct
 */
contract NumberPredictionGame {
    // Owner of the contract
    address public owner;
    
    // Game settings
    uint256 public minBet = 0.001 ether;  // Minimum bet: 0.001 ETH
    uint256 public maxBet = 1 ether;      // Maximum bet: 1 ETH
    uint256 public houseEdge = 5;         // House edge: 5% (stored as percentage)
    
    // Game counter
    uint256 public gameCounter;
    
    // Game structure
    struct Game {
        address player;
        uint256 betAmount;
        uint8 predictedNumber;  // 1-6
        uint8 resultNumber;     // 1-6
        bool isComplete;
        bool won;
        uint256 timestamp;
    }
    
    // Mapping from game ID to Game
    mapping(uint256 => Game) public games;
    
    // Mapping from player address to array of game IDs
    mapping(address => uint256[]) private playerGames;
    
    // Events
    event GamePlayed(
        uint256 indexed gameId,
        address indexed player,
        uint256 betAmount,
        uint8 predictedNumber,
        uint8 resultNumber,
        bool won,
        uint256 payout
    );
    
    event FundsDeposited(address indexed depositor, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier validBet() {
        require(msg.value >= minBet, "Bet amount is too low");
        require(msg.value <= maxBet, "Bet amount is too high");
        _;
    }
    
    modifier validNumber(uint8 _number) {
        require(_number >= 1 && _number <= 6, "Number must be between 1 and 6");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
        gameCounter = 0;
    }
    
    /**
     * @dev Play the game by predicting a number
     * @param _predictedNumber The number player predicts (1-6)
     */
    function play(uint8 _predictedNumber) 
        external 
        payable 
        validBet 
        validNumber(_predictedNumber) 
    {
        // Increment game counter
        gameCounter++;
        uint256 gameId = gameCounter;
        
        // Generate random result (1-6)
        uint8 resultNumber = _generateRandomNumber();
        
        // Determine if player won
        bool won = (resultNumber == _predictedNumber);
        
        // Calculate payout
        uint256 payout = 0;
        if (won) {
            // 6x multiplier for correct prediction
            payout = msg.value * 6;
            
            // Check if contract has enough balance
            require(address(this).balance >= payout, "Insufficient contract balance");
            
            // Transfer payout to player
            (bool success, ) = payable(msg.sender).call{value: payout}("");
            require(success, "Payout transfer failed");
        }
        
        // Store game data
        games[gameId] = Game({
            player: msg.sender,
            betAmount: msg.value,
            predictedNumber: _predictedNumber,
            resultNumber: resultNumber,
            isComplete: true,
            won: won,
            timestamp: block.timestamp
        });
        
        // Track player's games
        playerGames[msg.sender].push(gameId);
        
        // Emit event
        emit GamePlayed(
            gameId,
            msg.sender,
            msg.value,
            _predictedNumber,
            resultNumber,
            won,
            payout
        );
    }
    
    /**
     * @dev Generate a pseudo-random number between 1 and 6
     * Note: This is NOT cryptographically secure. For production, use Chainlink VRF.
     */
    function _generateRandomNumber() private view returns (uint8) {
        uint256 random = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao, // replaces block.difficulty in post-merge Ethereum
                    msg.sender,
                    gameCounter
                )
            )
        );
        return uint8((random % 6) + 1); // Returns 1-6
    }
    
    /**
     * @dev Get game details by game ID
     */
    function getGame(uint256 _gameId) 
        external 
        view 
        returns (
            address player,
            uint256 betAmount,
            uint8 predictedNumber,
            uint8 resultNumber,
            bool won,
            uint256 timestamp
        ) 
    {
        Game memory game = games[_gameId];
        return (
            game.player,
            game.betAmount,
            game.predictedNumber,
            game.resultNumber,
            game.won,
            game.timestamp
        );
    }
    
    /**
     * @dev Get all game IDs for a specific player (limited by _limit)
     */
    function getPlayerGames(address _player, uint256 _limit) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory allGames = playerGames[_player];
        uint256 length = allGames.length;
        
        if (length == 0) {
            return new uint256[](0);
        }
        
        // Limit the number of games returned
        uint256 returnLength = length > _limit ? _limit : length;
        uint256[] memory limitedGames = new uint256[](returnLength);
        
        // Return most recent games first
        for (uint256 i = 0; i < returnLength; i++) {
            limitedGames[i] = allGames[length - 1 - i];
        }
        
        return limitedGames;
    }
    
    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Deposit funds to the contract (house bankroll)
     */
    function depositFunds() external payable {
        require(msg.value > 0, "Must send ETH");
        emit FundsDeposited(msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw funds from the contract (only owner)
     */
    function withdraw(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        
        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(owner, _amount);
    }
    
    /**
     * @dev Set minimum and maximum bet limits (only owner)
     */
    function setBetLimits(uint256 _minBet, uint256 _maxBet) external onlyOwner {
        require(_minBet > 0, "Min bet must be greater than 0");
        require(_maxBet > _minBet, "Max bet must be greater than min bet");
        
        minBet = _minBet;
        maxBet = _maxBet;
    }
    
    /**
     * @dev Set house edge percentage (only owner)
     */
    function setHouseEdge(uint256 _houseEdge) external onlyOwner {
        require(_houseEdge <= 20, "House edge cannot exceed 20%");
        houseEdge = _houseEdge;
    }
    
    /**
     * @dev Transfer ownership (only owner)
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        owner = _newOwner;
    }
    
    /**
     * @dev Receive function to accept ETH deposits
     */
    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }
}