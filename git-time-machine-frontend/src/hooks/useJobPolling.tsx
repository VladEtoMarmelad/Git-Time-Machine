import { useState, useRef, useCallback, useEffect } from "react";
import { JobStatus } from "@/types/JobStatus";

type PollCallback<T> = (jobId: string) => Promise<{
  state: JobStatus;
  result?: T;
  failedReason?: string;
}>;

// Declaring T (result) and P (launch parameters) in the interface
interface UseJobPollingProps<T, P> {
  startJobFn: (params: P) => Promise<string>;
  pollJobFn: PollCallback<T>;
}

// Declare generics <T, P> before the arguments of the arrow function
export const useJobPolling = <T, P = any>({ startJobFn, pollJobFn }: UseJobPollingProps<T, P>) => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus>("idle");
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Params type as P
  const start = useCallback(async (params: P) => {
    setStatus("processing");
    setError(null);
    setResult(null);
    try {
      const id = await startJobFn(params);
      setJobId(id);
    } catch (error: any) {
      setStatus("failed");
      setError(error.message || "Failed to start job");
    }
  }, [startJobFn]);

  useEffect(() => {
    if (!jobId || status !== "processing") return;

    intervalRef.current = setInterval(async () => {
      try {
        const data = await pollJobFn(jobId);
        if (data.state === "completed" && data.result) {
          setResult(data.result);
          setStatus("completed");
          setJobId(null);
        } else if (data.state === "failed") {
          setError(data.failedReason || "Unknown error");
          setStatus("failed");
          setJobId(null);
        }
      } catch (error: unknown) {
        console.error("Error: ", error)
      }
    }, 1500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [jobId, status, pollJobFn]);

  return {start, status, result, error, reset: () => setStatus("idle")};
};