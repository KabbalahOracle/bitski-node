import { AccessTokenProvider, BitskiEngine } from 'bitski-provider';
import { ProviderOptions } from './index';
import { NodeFetchSubprovider } from './subproviders/fetch';
import TransactionOperator from './transaction-operator';

function chainIdFromNetworkName(networkName?: string): number {
  switch (networkName) {
    case 'ropsten':
      return 3;
    case 'rinkeby':
      return 4;
    case 'goerli':
      return 5;
    case 'kovan':
      return 42;
    default:
      return 1;
  }
}

/**
 * A Bitski powered web3 provider that is designed for use in Node
 */
export default class BitskiNodeProvider extends BitskiEngine {
  public rpcUrl: string;
  public clientId: string;
  public transactionOperator: TransactionOperator;
  private tokenProvider: AccessTokenProvider;
  private headers: object;

  /**
   * Creates a new BitskiNodeProvider
   * @param clientId Client id
   * @param tokenProvider An AccessTokenProvider instance for getting access tokens
   * @param networkName Ethereum network to use. Default: mainnet
   * @param options Additional options
   */
  constructor(clientId: string, tokenProvider: AccessTokenProvider, networkName?: string, options?: ProviderOptions) {
    super(options);
    this.clientId = clientId;
    this.rpcUrl = `https://api.bitski.com/v1/web3/${networkName || 'mainnet'}`;
    this.tokenProvider = tokenProvider;

    // Assign defaults
    this.headers = {
      'X-API-KEY': this.clientId,
      'X-CLIENT-ID': this.clientId,
    };

    // Allow for adding additional headers without overriding defaults
    if (options && options.additionalHeaders) {
      this.headers = Object.assign({}, options.additionalHeaders, this.headers);
    }

    this.addSubproviders();

    this.transactionOperator = new TransactionOperator(tokenProvider, chainIdFromNetworkName(networkName));
  }

  public getAccessToken(): Promise<string> {
    return this.tokenProvider.getAccessToken();
  }

  protected addSubproviders() {
    const fetchSubprovider = new NodeFetchSubprovider(
      this.rpcUrl,
      false,
      this.tokenProvider,
      this.headers,
    );
    this.addProvider(fetchSubprovider);
  }

}
