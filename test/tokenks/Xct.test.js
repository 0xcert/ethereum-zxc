const Zxc = artifacts.require('Zxc');
const assertRevert = require('@0xcert/ethereum-utils/test/helpers/assertRevert');

contract('erc/Zxc', (accounts) => {
  let token;
  const owner = accounts[0];
  const tokenTotalSupply = new web3.BigNumber('4e+26');
  const tokenName = "0xcert Protocol Token";
  const tokenSymbol  = "ZXC";
  const tokenDecimals = "18";
  const ownerSupply = new web3.BigNumber('4e+26');

  const decimalsMul = new web3.BigNumber('1e+18');
  const tokenAmount = decimalsMul.mul(100);

  beforeEach(async () => {
    token = await Zxc.new();
  });

  it('emits Transfer event on transfer', async () => {
    await token.enableTransfer();
    const { logs } = await token.transfer(accounts[1], 100);
    const event = logs.find(e => e.event === 'Transfer');
    assert.notEqual(event, undefined);
  });

  it('throws when trying to transfer before transfer is enabled', async () => {
    await assertRevert(token.transfer(accounts[1], tokenAmount));
  });

  it('throws when trying to transfer more than available balance', async () => {
    const moreThanBalance = tokenTotalSupply.plus(1);
    await token.enableTransfer();
    await assertRevert(token.transfer(accounts[1], moreThanBalance));
  });

  it('throws when trying to transfer to 0x0', async () => {
    await token.enableTransfer();
    await assertRevert(token.transfer(0x0, tokenAmount));
  });

  it('throws when trying to transfer to contract address', async () => {
    await token.enableTransfer();
    await assertRevert(token.transfer(token.address, tokenAmount));
  });

  it('throws when trying to transfer to crowdsale address', async () => {
    await token.enableTransfer();
    await token.setCrowdsaleAddress(accounts[3]);
    await assertRevert(token.transfer(accounts[3], tokenAmount));
  });

  it('returns the correct allowance amount after approval', async () => {
    await token.approve(accounts[1], tokenAmount);
    const allowance = await token.allowance(owner, accounts[1]);
    assert.equal(allowance.toString(), tokenAmount.toString());
  });

  it('emits Approval event after approval', async () => {
    const { logs } = await token.approve(accounts[1], tokenAmount);
    const event = logs.find(e => e.event === 'Approval');
    assert.notEqual(event, undefined);
  });

  it('returns correct balances after transfering from another account', async () => {
    await token.enableTransfer();
    await token.approve(accounts[1], tokenAmount);
    await token.transferFrom(owner, accounts[2], tokenAmount, { from: accounts[1] });
    const balance0 = await token.balanceOf(owner);
    const balance1 = await token.balanceOf(accounts[2]);
    const balance2 = await token.balanceOf(accounts[1]);
    assert.equal(balance0.toString(), tokenTotalSupply.minus(tokenAmount).toString());
    assert.equal(balance1.toString(), tokenAmount.toString());
    assert.equal(balance2, 0);
  });

  it('emits Transfer event on transferFrom', async () => {
    await token.enableTransfer();
    await token.approve(accounts[1], tokenAmount);
    const { logs } = await token.transferFrom(owner, accounts[2], tokenAmount, { from: accounts[1] });
    const event = logs.find(e => e.event === 'Transfer');
    assert.notEqual(event, undefined);
  });

  it('throws when trying to transferFrom more than allowed amount', async () => {
    const tokenAmountAllowed = decimalsMul.mul(99);
    await token.enableTransfer();
    await token.approve(accounts[1], tokenAmountAllowed);
    await assertRevert(token.transferFrom(owner, accounts[2], tokenAmount, { from: accounts[1] }));
  });

  it('throws an error when trying to transferFrom more than _from has', async () => {
    await token.enableTransfer();
    await token.approve(accounts[1], ownerSupply.plus(1));
    await assertRevert(token.transferFrom(owner, accounts[2], ownerSupply.plus(1),
      { from: accounts[1]}));
  });

  it('throws when trying to transferFrom before transfers enabled', async () => {
    await token.approve(accounts[1], tokenAmount);
    await assertRevert(token.transferFrom(owner, accounts[2], tokenAmount, { from: accounts[1] }));
  });

  it('throws when trying to transferFrom to 0x0', async () => {
    await token.enableTransfer();
    await token.approve(accounts[1], tokenAmount);
    await assertRevert(token.transferFrom(owner, 0x0, tokenAmount, { from: accounts[1] }));
  });

  it('throws when trying to transferFrom to contract address', async () => {
    await token.enableTransfer();
    await token.approve(accounts[1], tokenAmount);
    await assertRevert(token.transferFrom(owner, token.address, tokenAmount, { from: accounts[1] }));
  });

  it('allows token burning by the owner', async () => {
    const tokensToBurn = decimalsMul.mul(1);
    await token.enableTransfer();
    const totalSupplyPrior = await token.totalSupply();
    const { logs } = await token.burn(tokensToBurn, {from: owner});

    const totalSupplyAfter = await token.totalSupply();
    const balance = await token.balanceOf(owner);
    assert.equal(balance.toString(), totalSupplyAfter.toString());

    assert.equal(totalSupplyAfter.toString(), totalSupplyPrior.minus(tokensToBurn).toString());

    const event = logs.find(e => e.event === 'Burn');
    assert.notEqual(event, undefined);
  });

  it('allows only owner to burn tokens', async () => {
    await assertRevert(token.burn(1, { from: accounts[1] }));
  });

  it('does not allow owner to burn more than available balance', async () => {
    await assertRevert(token.burn(tokenTotalSupply.plus(1), { from: owner }));
  });

  it('should set crowdsale address', async () => {
    await token.setCrowdsaleAddress(accounts[1]);
    const actualCrowdsaleAddr = await token.crowdsaleAddress();
    assert.equal(actualCrowdsaleAddr, accounts[1]);
  });

  it('should re-set crowdsale address', async () => {
    await token.setCrowdsaleAddress(accounts[1]);
    let actualCrowdsaleAddr = await token.crowdsaleAddress();
    assert.equal(actualCrowdsaleAddr, accounts[1]);

    await token.setCrowdsaleAddress(accounts[2]);
    actualCrowdsaleAddr = await token.crowdsaleAddress();
    assert.equal(actualCrowdsaleAddr, accounts[2]);
  });

  it('should set crowdsale address only if called by owner', async () => {
    await assertRevert(token.setCrowdsaleAddress(accounts[2], {from: accounts[1]}));
  });

  it('should allow transfers only for crowdsale address when transfers disabled', async () => {
    const approvedTokens = decimalsMul.mul(100);
    await token.setCrowdsaleAddress(accounts[1]);
    await token.approve(accounts[1], approvedTokens);
    // Transfer 10 tokens from crowdsale to account2
    await token.transferFrom(owner, accounts[2], decimalsMul.mul(10), {from: accounts[1]});
    let accountBalance = await token.balanceOf(accounts[2]);
    assert.strictEqual(accountBalance.toString(), decimalsMul.mul(10).toString());

    // Transfer 5 tokens from account2 to account3 - should fail!
    await assertRevert(token.transfer(accounts[3], decimalsMul.mul(5), {from: accounts[2]}));
    // Transfer 5 tokens from owner to account3 - should fail!
    await assertRevert(token.transfer(accounts[3], decimalsMul.mul(5), {from: owner}));

    await token.enableTransfer();
    // Transfer 5 tokens from account2 to account3 - should succeed!
    await token.transfer(accounts[3], decimalsMul.mul(3), {from: accounts[2]});
    // Transfer 5 tokens from account2 to account3 - should succeed!
    await token.transfer(accounts[3], decimalsMul.mul(4), {from: owner});
    accountBalance = await token.balanceOf(accounts[3]);
    assert.strictEqual(accountBalance.toString(), decimalsMul.mul(7).toString());
  });

});
