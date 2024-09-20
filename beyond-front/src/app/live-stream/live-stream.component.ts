import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import Hls from 'hls.js';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-live-stream',
  templateUrl: './live-stream.component.html',
  styleUrls: ['./live-stream.component.scss'],
})
export class LiveStreamComponent implements OnInit, OnDestroy {
  @Input() id: number | undefined;
  private video: HTMLVideoElement | null = null;
  private hls: Hls | null = null;
  public isLoading: boolean = true;

  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      this.video = document.getElementById(`video${this.id}`) as HTMLVideoElement;

      if (!this.video) {
        console.error(`Video element with ID video${this.id} not found`);
        return;
      }

      if (Hls.isSupported()) {
        this.hls = new Hls({
          liveSyncDurationCount: 1, // Close to live edge
          maxBufferLength: 3, // Reduce the buffer size to 3 seconds
          maxMaxBufferLength: 6, // Lower maximum buffer length to 6 seconds
          lowLatencyMode: true, // Ensure low latency
        });
        this.hls.loadSource(`${environment.apiUrl}/hls/stream1/stream.m3u8`);
        this.hls.attachMedia(this.video);
        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
          this.tryPlayVideo();
        });
        this.hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS.js error:', data.fatal, data);
        });
        this.hls.on(Hls.Events.BUFFER_APPENDED, () => {
          this.isLoading = false;
        });
      } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
        this.video.src = `${environment.apiUrl}/hls/stream1/stream.m3u8`;
        this.video.addEventListener('loadedmetadata', () => {
          this.tryPlayVideo();
        });
        this.video.addEventListener('error', (e) => {
          console.error('HTML5 video error:', e);
        });
        this.video.addEventListener('canplay', () => {
          this.isLoading = false;
        });
      } else {
        console.error('HLS not supported in this browser');
        this.isLoading = false;
      }

      this.setupUnmuteOnInteraction();
      this.setupAutoResume();
      this.handleVisibilityChange();
    }, 100);
  }

  private tryPlayVideo(): void {
    setTimeout(() => {
      if (this.video) {
        this.video.muted = true;
        this.video
          .play()
          .then(() => {
            console.log('Video is playing');
            this.isLoading = false;
          })
          .catch((error) => {
            console.error('Error attempting to play video:', error);
            this.setupAutoResume();
          });
      }
    }, 500);
  }

  private setupUnmuteOnInteraction(): void {
    const unmuteVideo = () => {
      if (this.video) {
        this.video.muted = false;
        this.video.play().catch(console.error);
        document.removeEventListener('click', unmuteVideo);
        document.removeEventListener('keydown', unmuteVideo);
      }
    };

    document.addEventListener('click', unmuteVideo);
    document.addEventListener('keydown', unmuteVideo);
  }

  private setupAutoResume(): void {
    if (this.video) {
      this.video.addEventListener('pause', () => {
        if (!this.video!.paused && !this.video!.ended) {
          this.tryPlayVideo();
        }
      });
    }
  }

  // Handle tab visibility changes to resume live stream
  private handleVisibilityChange(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab is now visible, resuming live stream');
        this.restartStream();
      }
    });
  }

  // Restart stream to ensure it continues from the live point
  private restartStream(): void {
    if (this.video && this.hls) {
      this.hls.detachMedia();
      this.hls.loadSource(`${environment.apiUrl}/hls/stream1/stream.m3u8`);
      this.hls.attachMedia(this.video);
      this.tryPlayVideo();
    }
  }

  ngOnDestroy(): void {
    if (this.hls) {
      this.hls.destroy();
    }
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}
