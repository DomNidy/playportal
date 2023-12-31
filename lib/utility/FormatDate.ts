export function formatRelativeDateFromEpoch(seconds: number) {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const timeDifference = nowInSeconds - seconds;

  console.log("Formatting seconds", seconds, `Time diff = ${timeDifference}`);

  if (timeDifference <= 1) {
    return "Just now";
  } else if (timeDifference < 60) {
    // Within 60 seconds
    return `${Math.floor(timeDifference)} ${
      timeDifference === 1 ? "second" : "seconds"
    } ago`;
  } else if (timeDifference < 60 * 60) {
    // Within 60 minutes
    const minutesAgo = Math.floor(timeDifference / 60);
    return `${minutesAgo} ${minutesAgo === 1 ? "minute" : "minutes"} ago`;
  } else if (timeDifference < 24 * 60 * 60) {
    // Within 24 hours
    const hoursAgo = Math.floor(timeDifference / (60 * 60));
    return `${hoursAgo} ${hoursAgo === 1 ? "hour" : "hours"} ago`;
  } else if (timeDifference < 7 * 24 * 60 * 60) {
    // Within 7 days
    const daysAgo = Math.floor(timeDifference / (24 * 60 * 60));
    return `${daysAgo} ${daysAgo === 1 ? "day" : "days"} ago`;
  } else {
    // Over 7 days
    const formattedDate = new Date(seconds * 1000);
    return `${formattedDate.getDate().toString().padStart(2, "0")}/${(
      formattedDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${formattedDate.getFullYear()} @ ${formatAMPM(
      formattedDate
    )}`;
  }
}

function formatAMPM(date: Date) {
  let hours = date.getHours();
  let minutes: any = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be displayed as 12
  minutes = minutes < 10 ? "0" + minutes : minutes;
  const time = `${hours}:${minutes} ${ampm}`;
  return time;
}

export function iso8601DurationToMilliseconds(duration: string): number {
  const regex = /PT(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = duration.match(regex);

  if (!matches) {
    throw new Error("Invalid ISO 8601 duration format");
  }

  const minutes = matches[1] ? parseInt(matches[1]) : 0;
  const seconds = matches[2] ? parseInt(matches[2]) : 0;

  const durationInMilliseconds = (minutes * 60 + seconds) * 1000;
  return durationInMilliseconds;
}
export function iso8601DateToMilliseconds(iso_date_string: string) {
  const date = new Date(iso_date_string);
  const timestamp = date.getTime();
  if (isNaN(timestamp)) {
    throw new Error("Invalid ISO 8601 date format");
  }
  return timestamp;
}
