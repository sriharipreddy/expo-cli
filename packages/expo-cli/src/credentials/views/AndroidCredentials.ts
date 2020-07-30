import isEmpty from 'lodash/isEmpty';

import CommandError from '../../CommandError';
import log from '../../log';
import prompt from '../../prompt';
import { displayAndroidAppCredentials } from '../actions/list';
import { Context, IView } from '../context';
import { DownloadKeystore, RemoveKeystore, UpdateKeystore } from './AndroidKeystore';
import { UpdateFcmKey } from './AndroidPushCredentials';

class ExperienceView implements IView {
  constructor(private experienceName: string) {}

  async open(ctx: Context): Promise<IView | null> {
    const credentials = await ctx.android.fetchCredentials(this.experienceName);

    if (isEmpty(credentials.keystore) && isEmpty(credentials.pushCredentials)) {
      log(`No credentials available for ${this.experienceName} experience.\n`);
    } else if (this.experienceName) {
      log.newLine();
      await displayAndroidAppCredentials(credentials);
      log.newLine();
    }

    if (ctx.nonInteractive) {
      throw new CommandError(
        'NON_INTERACTIVE',
        "Start the CLI without the '--non-interactive' flag to manage keystores."
      );
    }

    const { action } = await prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What do you want to do?',
        choices: [
          { value: 'update-keystore', name: 'Update upload Keystore' },
          { value: 'remove-keystore', name: 'Remove keystore' },
          { value: 'update-fcm-key', name: 'Update FCM Api Key' },
          { value: 'fetch-keystore', name: 'Download Keystore from the Expo servers' },
          // { value: 'fetch-public-cert', name: 'Extract public cert from Keystore' },
          // {
          //   value: 'fetch-private-signing-key',
          //   name:
          //     'Extract private signing key (required when migration to App Signing by Google Play)',
          // },
        ],
      },
    ]);

    return this.handleAction(ctx, action);
  }

  handleAction(context: Context, selected: string): IView | null {
    switch (selected) {
      case 'update-keystore':
        return new UpdateKeystore(this.experienceName);
      case 'remove-keystore':
        return new RemoveKeystore(this.experienceName);
      case 'update-fcm-key':
        return new UpdateFcmKey(this.experienceName);
      case 'fetch-keystore':
        return new DownloadKeystore(this.experienceName);
      case 'fetch-public-cert':
        return null;
    }
    return null;
  }
}

export { ExperienceView };
