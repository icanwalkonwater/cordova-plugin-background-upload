import { Component, NgZone } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { File } from '@ionic-native/file/ngx';

const TEST_UPLOAD_URL = 'http://speedtest.tele2.net/upload.php';
const ID_OFFSET = 100;

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const FileTransferManager: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  providers: [ImagePicker, File],
})
export class Tab1Page {
  uploader: any;

  images: Array<string> = [];
  imageUris: Array<string> = [];
  uploadStates: Map<number, UploadState> = new Map();

  constructor(
    private platform: Platform,
    private zone: NgZone,
    private alertController: AlertController,
    private imagePicker: ImagePicker,
    private file: File
  ) {
    this.platform.ready().then(() => {

      this.uploader = FileTransferManager.init({}, (event) => {
        console.log(event);

        this.zone.run(() => {
          const id = event.id - ID_OFFSET;

          if (!this.uploadStates.has(id)) {
            this.uploadStates.set(id, new UploadState());
          }
          const state = this.uploadStates.get(id);

          switch (event.state) {
            case 'UPLOADING':
              state.status = UploadStatus.InProgress;
              state.progress = event.progress;
              break;

            case 'UPLOADED':
              state.status = UploadStatus.Done;
              state.progress = 1.0;
              break;

            case 'FAILED':
              state.status = UploadStatus.Failed;
              this.alertController.create({
                header: 'Upload failed',
                message: event.error,
                buttons: ['Ok'],
              })
                .then((alert) => alert.present());
              break;
          }
        });
      });
    });
  }

  async onPickImage() {
    try {
      const uris: Array<string> = await this.imagePicker.getPictures({});
      console.log(uris);
      this.imageUris.push(...uris);

      const data = await Promise.all(uris.map((uri) => {
        const pathSplit = uri.split('/');
        const filename = pathSplit.pop();
        const dir = pathSplit.join('/');
        return this.file.readAsDataURL(dir, filename);
      }));
      this.images.push(...data);
    } catch (err) {
      const alert = await this.alertController.create({
        header: 'An error occurred',
        message: JSON.stringify(err),
        buttons: ['Ok =('],
      });

      await alert.present();
    }
  }

  onUploadImage(id: number) {
    const uri = this.imageUris[id];

    console.log('Start upload');
    const options = {
      serverUrl: 'https://en7paaa03bwd.x.pipedream.net/',
      filePath: uri,
      fileKey: 'file',
      id: id + ID_OFFSET,
      notificationTitle: 'Uploading image (Job 0)',
      headers: {},
      parameters: {
        colors: 1,
        faces: 1,
        image_metadata: 1,
        phash: 1,
        signature: '924736486',
        tags: 'device_id_F13F74C5-4F03-B800-2F76D3C37B27',
        timestamp: 1572858811,
        type: 'authenticated'
      }
    };
    console.log(options);
    this.uploader.startUpload(options);
    console.log('Upload submitted');
  }
}

export enum UploadStatus {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  InProgress,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Done,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Failed,
}

export class UploadState {
  status = UploadStatus.InProgress;
  progress = 0;
}
