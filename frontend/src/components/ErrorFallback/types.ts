export interface ErrorProps {
	error: Error;
	resetErrorBoundary: (...args: unknown[]) => void;
}
