import {Context, Get, HttpResponseOK} from '@foal/core';
import {Account, Keypair, Memo, MemoID, Networks, Operation, TransactionBuilder} from 'stellar-sdk';
import {randomBytes} from 'crypto';

const network = Networks.TESTNET

export class Sep10Controller {
  keypair = Keypair.random()

  /**
   * request path params: {
   *  account : string,
   *  memo? : string,
   *  home_domain? : string,
   *  client_domain? : string
   * }
   *
   */
  @Get('/')
  async challenge(ctx: Context){
    const account = ctx.request.query.account as string
    const memo = ctx.request.query.memo as string
    const home_domain = ctx.request.query.home_domain as string
    const client_domain = ctx.request.query.client_domain as string

    console.log({
      account,
      memo,
      home_domain,
      client_domain
    })
    //Unix epoch in seconds
    const now = Math.round(Date.now() / 1000)
    const txBuilder = new TransactionBuilder(new Account(this.keypair.publicKey(), '0'),{
      networkPassphrase : network,
      fee : '100',
      timebounds: {
        minTime: now,
        maxTime: now + 900 // 15 min duration
      },

    }).addOperation(
        Operation.manageData({
          source: account,
          name: `${home_domain} auth`,
          value: randomBytes(48).toString('base64')
        })
    ).addOperation(
        Operation.manageData({
          source: this.keypair.publicKey(),
          name: 'web_auth_domain',
          value: ''//todo
        })
    )
    console.log(client_domain)
    if(client_domain !== undefined){
      txBuilder.addOperation(
          Operation.manageData({
            source: 'todo',//todo
            name: 'client_domain',
            value: client_domain
          })
      )
    }

    if(memo !== undefined){ //todo check if memo valid
      txBuilder.addMemo(new Memo(MemoID,memo))
    }

    const tx = txBuilder.build()
    tx.sign(this.keypair)


    return new HttpResponseOK({
      transaction : tx.toXDR(),
      network_passphrase : network
    })
  }

}
