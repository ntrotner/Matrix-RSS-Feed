import { rssRoom } from '../../interfaces/rss.interface';
import { sendMessage } from '../matrix-lib/matrix-operations';
import { getRSSFeed } from './rss-handler';

/**
 * request rss feed and send new items to room
 *
 * @param client
 * @param toFetch
 * @param lastUpdated
 */
export async function sendUpdatesFromRSS(client: any, toFetch: rssRoom, lastUpdated: number) {
  return new Promise((resolve, reject) => {
    client.setGlobalErrorOnUnknownDevices(false);
    // if synced then proceed
    client.once('sync', async(state, _, __) => {
      if (state !== 'PREPARED') {
        console.error('CAN\'T CONNECT TO MATRIX');
        resolve('Failed');
        return;
      }

      for (const rssInfo of toFetch.emitter) {
        try {
          const newEntries = await getRSSFeed(rssInfo.url, lastUpdated, rssInfo.name);
          if (newEntries) sendMessage(client, toFetch.roomURL, newEntries);
        } catch (e) {
          console.error(e);
        }
      }
    });
    resolve('Done');
  });
}
