const Zxc = artifacts.require('Zxc');
const assertRevert = require('../../node_modules/@0xcert/ethereum-utils/test/helpers/assertRevert');

contract('erc/Zxc', (accounts) => {
  let token;
  const owner = accounts[0];
  const tokenTotalSupply = new web3.BigNumber('4e+26');
  const tokenName = "0xcert Protocol Token";
  const tokenSymbol  = "ZXC";
  const tokenDecimals = "18";
  const ownerSupply = new web3.BigNumber('4e+26');

  beforeEach(async () => {
    token = await Zxc.new();
  });

  it('has correct tokenSupply after construction', async () => {
    const actualSupply = await token.totalSupply();
    assert.equal(actualSupply.toString(), tokenTotalSupply.toString());
  });

  it('has correct token name after construction', async () => {
    const actualName = await token.name();
    assert.equal(actualName, tokenName);
  });

  it('has correct token symbol after construction', async () => {
    const actualSymbol = await token.symbol();
    assert.equal(actualSymbol, tokenSymbol);
  });

  it('has correct token decimals after construction', async () => {
    const actualDecimals = await token.decimals();
    assert.equal(actualDecimals.toString(), tokenDecimals);
  });

  it('has correct owner token balance after construction', async () => {
    const actualBalance = await token.balanceOf(owner);
    assert.equal(actualBalance.toString(), ownerSupply.toString());
  });

  it('returns correct balances after transfer', async () => {
    await token.enableTransfer();
    await token.transfer(accounts[1], 100);
    const firstAccountBalance = await token.balanceOf(owner);
    const secondAccountBalance = await token.balanceOf(accounts[1]);
    assert.equal(firstAccountBalance.toString(), tokenTotalSupply.minus(100).toString());
    assert.equal(secondAccountBalance, 100);
  });

  it('emits Transfer event on transfer', async () => {
    await token.enableTransfer();
    const { logs } = await token.transfer(accounts[1], 100);
    const event = logs.find(e => e.event === 'Transfer');
    assert.notEqual(event, undefined);
  });

  it('throws when trying to transfer before transfer is enabled', async () => {
    await assertRevert(token.transfer(accounts[1], 100));
  });

  it('throws when trying to transfer more than available balance', async () => {
    const moreThanBalance = tokenTotalSupply.plus(1);
    await token.enableTransfer();
    await assertRevert(token.transfer(accounts[1], moreThanBalance));
  });

  it('throws when trying to transfer to 0x0', async () => {
    await token.enableTransfer();
    await assertRevert(token.transfer(0x0, 100));
  });

  it('throws when trying to transfer to contract address', async () => {
    await token.enableTransfer();
    await assertRevert(token.transfer(token.address, 100));
  });

  it('returns the correct allowance amount after approval', async () => {
    await token.approve(accounts[1], 100);
    const allowance = await token.allowance(owner, accounts[1]);
    assert.equal(allowance, 100);
  });

  it('emits Approval event after approval', async () => {
    const { logs } = await token.approve(accounts[1], 100);
    const event = logs.find(e => e.event === 'Approval');
    assert.notEqual(event, undefined);
  });

  it('returns correct balances after transfering from another account', async () => {
    await token.enableTransfer();
    await token.approve(accounts[1], 100);
    await token.transferFrom(owner, accounts[2], 100, { from: accounts[1] });
    const balance0 = await token.balanceOf(owner);
    const balance1 = await token.balanceOf(accounts[2]);
    const balance2 = await token.balanceOf(accounts[1]);
    assert.equal(balance0.toString(), tokenTotalSupply.minus(100).toString());
    assert.equal(balance1, 100);
    assert.equal(balance2, 0);
  });

  it('emits Transfer event on transferFrom', async () => {
    await token.enableTransfer();
    await token.approve(accounts[1], 100);
    const { logs } = await token.transferFrom(owner, accounts[2], 100, { from: accounts[1] });
    const event = logs.find(e => e.event === 'Transfer');
    assert.notEqual(event, undefined);
  });

  it('throws when trying to transferFrom more than allowed amount', async () => {
    await token.enableTransfer();
    await token.approve(accounts[1], 99);
    await assertRevert(token.transferFrom(owner, accounts[2], 100, { from: accounts[1] }));
  });

  it('throws an error when trying to transferFrom more than _from has', async () => {
    await token.enableTransfer();
    await token.approve(accounts[1], ownerSupply.plus(1));
    await assertRevert(token.transferFrom(owner, accounts[2], ownerSupply.plus(1),
      { from: accounts[1]}));
  });

  it('returns 0 allowance by default', async () => {
    const preApproved = await token.allowance(owner, accounts[1]);
    assert.equal(preApproved, 0);
  });

  it('increases and decreases allowance after approval', async () => {
    await token.approve(accounts[1], 50);
    const postIncrease = await token.allowance(owner, accounts[1]);
    assert.equal(postIncrease.toString(), '50');
    await token.approve(accounts[1], 0);
    await token.approve(accounts[1], 40);
    const postDecrease = await token.allowance(owner, accounts[1]);
    assert.equal(postIncrease.minus(10).toString(), postDecrease.toString());
  });

  it('throws when approving without setting it to 0 first', async () => {
    await token.approve(accounts[1], 50);
    await assertRevert(token.approve(accounts[1], 100));
  });

  it('throws when trying to transferFrom before transfers enabled', async () => {
    await token.approve(accounts[1], 100);
    await assertRevert(token.transferFrom(owner, accounts[2], 100, { from: accounts[1] }));
  });

  it('throws when trying to transferFrom to 0x0', async () => {
    await token.enableTransfer();
    await token.approve(accounts[1], 100);
    await assertRevert(token.transferFrom(owner, 0x0, 100, { from: accounts[1] }));
  });

  it('throws when trying to transferFrom to contract address', async () => {
    await token.enableTransfer();
    await token.approve(accounts[1], 100);
    await assertRevert(token.transferFrom(owner, token.address, 100, { from: accounts[1] }));
  });

  it('allows token burning by the owner', async () => {
    await token.enableTransfer();
    const totalSupplyPrior = await token.totalSupply();
    const { logs } = await token.burn(1, {from: owner});

    const totalSupplyAfter = await token.totalSupply();
    const balance = await token.balanceOf(owner);
    assert.equal(balance.toString(), totalSupplyAfter);

    assert.equal(totalSupplyAfter.toString(), totalSupplyPrior.minus(1).toString());

    const event = logs.find(e => e.event === 'Burn');
    assert.notEqual(event, undefined);
  });

  it('allows only owner to burn tokens', async () => {
    await assertRevert(token.burn(1, { from: accounts[1] }));
  });

  it('does not allow owner to burn more than available balance', async () => {
    await assertRevert(token.burn(tokenTotalSupply.plus(1), { from: owner }));
  });

});
