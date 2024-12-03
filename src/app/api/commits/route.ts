import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const size = parseInt(searchParams.get("size") || "16");
  const username = searchParams.get("username") || "thatbeautifuldream";

  try {
    const response = await octokit.activity.listPublicEventsForUser({
      username,
      per_page: size,
      page,
    });

    const commits = response.data
      .filter((event) => event.type === "PushEvent")
      .flatMap((event: any) =>
        event.payload.commits.map((commit: any) => ({
          id: commit.sha,
          message: commit.message,
          author: {
            login: event.actor.login,
            avatar_url: event.actor.avatar_url,
          },
          timestamp: event.created_at,
          repo: event.repo.name,
          sha: commit.sha,
          url: `https://github.com/${event.repo.name}/commit/${commit.sha}`,
        }))
      );

    return NextResponse.json({
      commits,
      nextPage: commits.length === size ? page + 1 : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch commits", message: error },
      { status: 500 }
    );
  }
}
