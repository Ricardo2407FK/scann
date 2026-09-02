import PlagiarismChecker from "@/components/PlagiarismChecker";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Home() {
  return (
    <main>
      <ErrorBoundary>
        <PlagiarismChecker />
      </ErrorBoundary>
    </main>
  );
}
