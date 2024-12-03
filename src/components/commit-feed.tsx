"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import React from "react";
import { useInView } from "react-intersection-observer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, GitCommit, RefreshCw } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

async function fetchCommits({ pageParam }: { pageParam: number }) {
  const username = "shuding";
  const size = 16;
  const res = await fetch(
    `/api/commits?username=${username}&page=${pageParam}&size=${size}`
  );
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
}

export function CommitFeed() {
  const { ref, inView } = useInView();
  const [showRefreshMessage, setShowRefreshMessage] = React.useState(false);
  const [refreshTime, setRefreshTime] = React.useState<Date | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["commits"],
    queryFn: async ({ pageParam = 2 }) => fetchCommits({ pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    refetchInterval: 30000,
    initialPageParam: 2,
  });

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleRefresh = async () => {
    await refetch();
    setRefreshTime(new Date());
    setShowRefreshMessage(true);
    setTimeout(() => {
      setShowRefreshMessage(false);
    }, 2000);
  };

  if (status === "error") {
    return (
      <div className="flex h-[450px] w-full flex-col items-center justify-center gap-2 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm font-medium">Failed to load commits</p>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex h-[450px] w-full flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading commits...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {status === "success" && (
        <div className="sticky top-0 z-10 mb-4">
          <div className="relative flex items-center justify-between bg-muted/50 p-4 overflow-hidden backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="absolute inset-0 bg-green-400/5 animate-pulse-slow border border-green-400"></div>
            <div className="space-y-0.5 relative">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium">
                  Lifetime commits on GitHub
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefresh}
                    className="p-1 hover:bg-muted/80 rounded-full transition-colors"
                    title="Refresh data"
                  >
                    <RefreshCw className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                  {showRefreshMessage && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-muted-foreground"
                    >
                      Refreshed{" "}
                      {refreshTime
                        ? formatTimeAgo(refreshTime.toISOString())
                        : "just now"}
                    </motion.span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{data.pages[0].total}</p>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
              </div>
            </div>
            <div className="relative">
              <ModeToggle />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {data?.pages.map((page, pageIndex) =>
          page.commits.map((commit, index) => (
            <motion.div
              key={commit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1 + pageIndex * 0.1,
                ease: "easeOut",
              }}
              className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={commit.author.avatar_url} />
                  <AvatarFallback>
                    {commit.author.login.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                  <div className="flex items-center gap-2">
                    <GitCommit className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="truncate">{commit.message}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {commit.repo}
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                {formatTimeAgo(commit.timestamp)}
              </div>
            </motion.div>
          ))
        )}

        <div ref={ref} className="p-2">
          {isFetchingNextPage && (
            <div className="space-y-1">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
