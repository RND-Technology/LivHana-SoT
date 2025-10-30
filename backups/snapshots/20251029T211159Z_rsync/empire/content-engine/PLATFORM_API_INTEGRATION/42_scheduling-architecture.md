### Scheduling Architecture

```javascript
// scheduler.mjs
import cron from 'node-cron';
import fs from 'fs';
import { uploadToAllPlatforms } from './multi-platform-uploader.mjs';

/**
 * Schedule episodes for automatic posting
 */
export class EpisodeScheduler {
  constructor(credentials) {
    this.credentials = credentials;
    this.schedules = [];
    this.schedulePath = './config/schedule.json';
    this.loadSchedule();
  }

  /**
   * Load schedule from file
   */
  loadSchedule() {
    try {
      if (fs.existsSync(this.schedulePath)) {
        this.schedules = JSON.parse(fs.readFileSync(this.schedulePath));
        console.log(`✓ Loaded ${this.schedules.length} scheduled episodes`);
      }
    } catch (error) {
      console.error('Error loading schedule:', error.message);
      this.schedules = [];
    }
  }

  /**
   * Save schedule to file
   */
  saveSchedule() {
    try {
      fs.writeFileSync(this.schedulePath, JSON.stringify(this.schedules, null, 2));
      console.log('✓ Schedule saved');
    } catch (error) {
      console.error('Error saving schedule:', error.message);
    }
  }

  /**
   * Schedule episode for posting
   */
  scheduleEpisode(episode, postTime, platforms = ['youtube', 'tiktok', 'instagram', 'twitter']) {
    const scheduleEntry = {
      episodeNumber: episode.episodeNumber,
      episode,
      postTime: postTime.toISOString(),
      platforms,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    this.schedules.push(scheduleEntry);
    this.saveSchedule();

    // Create cron job for this episode
    this.createCronJob(scheduleEntry);

    console.log(`✓ Episode ${episode.episodeNumber} scheduled for ${postTime.toLocaleString()}`);
  }

  /**
   * Create cron job for scheduled episode
   */
  createCronJob(scheduleEntry) {
    const postTime = new Date(scheduleEntry.postTime);
    const cronExpression = `${postTime.getMinutes()} ${postTime.getHours()} ${postTime.getDate()} ${postTime.getMonth() + 1} *`;

    cron.schedule(cronExpression, async () => {
      console.log(`\n🚀 Auto-posting Episode ${scheduleEntry.episodeNumber}...`);

      try {
        const result = await uploadToAllPlatforms(
          scheduleEntry.episode,
          this.credentials,
          { platforms: scheduleEntry.platforms, sequential: true }
        );

        // Update schedule status
        scheduleEntry.status = 'posted';
        scheduleEntry.postedAt = new Date().toISOString();
        scheduleEntry.result = result;
        this.saveSchedule();

        console.log(`✓ Episode ${scheduleEntry.episodeNumber} posted successfully`);

      } catch (error) {
        console.error(`Error posting Episode ${scheduleEntry.episodeNumber}:`, error.message);
        scheduleEntry.status = 'failed';
        scheduleEntry.error = error.message;
        this.saveSchedule();
      }
    });

    console.log(`✓ Cron job created for Episode ${scheduleEntry.episodeNumber}`);
  }

  /**
   * Schedule entire series with optimal posting times
   */
  scheduleEntireSeries(episodes, startDate, postingSchedule) {
    /*
    postingSchedule example:
    {
      youtube: { days: ['monday', 'wednesday', 'friday'], time: '16:00' },
      tiktok: { days: ['daily'], time: '12:00' },
      instagram: { days: ['tuesday', 'thursday', 'saturday'], time: '17:00' },
      twitter: { days: ['daily'], time: '09:00' }
    }
    */

    const dayMap = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };

    let currentDate = new Date(startDate);

    episodes.forEach((episode, index) => {
      // Schedule for each platform based on its schedule
      Object.entries(postingSchedule).forEach(([platform, schedule]) => {
        const { days, time } = schedule;
        const [hours, minutes] = time.split(':').map(Number);

        // Find next valid day for this platform
        let scheduledDate = new Date(currentDate);

        if (days[0] === 'daily') {
          // Daily posting - use current date
          scheduledDate.setHours(hours, minutes, 0, 0);
        } else {
          // Find next valid day of week
          const targetDays = days.map(day => dayMap[day.toLowerCase()]);
          let daysToAdd = 0;

          while (!targetDays.includes((scheduledDate.getDay() + daysToAdd) % 7)) {
            daysToAdd++;
          }

          scheduledDate.setDate(scheduledDate.getDate() + daysToAdd);
          scheduledDate.setHours(hours, minutes, 0, 0);
        }

        // Schedule this episode for this platform
        this.scheduleEpisode(episode, scheduledDate, [platform]);
      });

      // Move to next day for next episode
      currentDate.setDate(currentDate.getDate() + 1);
    });

    console.log(`✓ Scheduled ${episodes.length} episodes across all platforms`);
  }

  /**
   * Get upcoming scheduled episodes
   */
  getUpcomingSchedule(days = 7) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return this.schedules
      .filter(schedule => {
        const postTime = new Date(schedule.postTime);
        return postTime >= now && postTime <= futureDate && schedule.status === 'scheduled';
      })
      .sort((a, b) => new Date(a.postTime) - new Date(b.postTime));
  }

  /**
   * Cancel scheduled episode
   */
  cancelSchedule(episodeNumber) {
    const index = this.schedules.findIndex(s => s.episodeNumber === episodeNumber && s.status === 'scheduled');

    if (index !== -1) {
      this.schedules[index].status = 'cancelled';
      this.schedules[index].cancelledAt = new Date().toISOString();
      this.saveSchedule();
      console.log(`✓ Schedule cancelled for Episode ${episodeNumber}`);
      return true;
    }

    return false;
  }
}
```

---
