pragma solidity ^0.4.24;

import "@0xcert/ethereum-utils/contracts/ownership/Ownable.sol";
import "@0xcert/ethereum-utils/contracts/math/SafeMath.sol";
import "@0xcert/ethereum-erc20/contracts/tokens/Token.sol";

/*
 * @title ZXC  protocol token.
 * @dev Standard ERC20 token used by the protocol. This contract follows the
 * implementation at https://goo.gl/64yCkF.
 */
contract Zxc is Token, Ownable {
  using SafeMath for uint256;

  /**
   * Transfer feature state.
   */
  bool internal transferEnabled;

  /**
   * @dev An event which is triggered when tokens are burned.
   * @param _burner The address which burns tokens.
   * @param _value The amount of burned tokens.
   */
  event Burn(
    address indexed _burner,
    uint256 _value
  );

  /**
   * @dev Assures that the provided address is a valid destination to transfer tokens to.
   * @param _to Target address.
   */
  modifier validDestination(address _to) {
    require(_to != address(0x0));
    require(_to != address(this));
    _;
  }

  /**
   * @dev Assures that tokens can be transfered.
   */
  modifier onlyWhenTransferAllowed() {
    require(transferEnabled);
    _;
  }

  /**
   * @dev Contract constructor.
   */
  constructor()
    public
  {
    tokenName = "0xcert Protocol Token";
    tokenSymbol = "ZXC";
    tokenDecimals = 18;
    tokenTotalSupply = 400000000000000000000000000;
    transferEnabled = false;

    balances[owner] = tokenTotalSupply;
    emit Transfer(address(0x0), owner, tokenTotalSupply);
  }

  /**
   * @dev transfer token for a specified address
   * @param _to The address to transfer to.
   * @param _value The amount to be transferred.
   */
  function transfer(address _to, uint256 _value)
    onlyWhenTransferAllowed()
    validDestination(_to)
    public
    returns (bool _success)
  {
    super.transfer(_to, _value);
    _success = true;
  }

  /**
   * @dev Transfer tokens from one address to another.
   * @param _from address The address which you want to send tokens from.
   * @param _to address The address which you want to transfer to.
   * @param _value uint256 the amount of tokens to be transferred.
   */
  function transferFrom(address _from, address _to, uint256 _value)
    onlyWhenTransferAllowed()
    validDestination(_to)
    public
    returns (bool _success)
  {
    super.transferFrom(_from, _to, _value);
    _success = true;
  }

  /**
   * @dev Enables token transfers.
   */
  function enableTransfer()
    onlyOwner()
    external
  {
    transferEnabled = true;
  }

  /**
   * @dev Burns a specific amount of tokens. Only owner is allowed to perform this operation. This
   * function is based on BurnableToken implementation at goo.gl/GZEhaq.
   * @param _value The amount of token to be burned.
   */
  function burn(uint256 _value)
    onlyOwner()
    external
  {
    require(_value <= balances[msg.sender]);

    balances[owner] = balances[owner].sub(_value);
    tokenTotalSupply = tokenTotalSupply.sub(_value);

    emit Burn(owner, _value);
    emit Transfer(owner, address(0x0), _value);
  }

}
