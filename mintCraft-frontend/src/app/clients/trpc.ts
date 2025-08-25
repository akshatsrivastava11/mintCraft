// utils/trpc.ts
import { httpBatchLink, httpLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import type { approuter } from '../../../../mintCraft-backend/src/trpc/routers';
import { NextPageContext } from 'next';

// Create a global function to get wallet address
// This will be set by your app when the wallet connects
let getWalletAddress: () => string = () => 'DLkK7oCoDct33byQ3uiLfSVTZTM988EJDksjfte7UN6m';

export const setWalletAddressGetter = (getter: () => string) => {
  getWalletAddress = getter;
};

export const trpc = createTRPCNext<typeof approuter>({
  config({ ctx }: { ctx?: NextPageContext | undefined }) {
    return {
      links: [
        httpLink({
          url: 'http://localhost:4000/trpc',
          headers() {
            // Use the global getter function instead of a hook
            const publicKey = getWalletAddress();
            
            console.log('tRPC headers - sending wallet address:', publicKey);
            
            return {
              'x-wallet': publicKey || '',
              'x-wallet-address': publicKey || '', // Alternative header name
              'authorization': publicKey ? `Bearer ${publicKey}` : '', // Another common format
            };
          },
        }),
      ],
          };
  },
  ssr: false,
});