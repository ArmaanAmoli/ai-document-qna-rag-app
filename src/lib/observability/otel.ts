import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Enable debug logging for troubleshooting
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: 'ai-document-qna-rag',
    [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4318/v1/traces',
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable fs instrumentation as it can be noisy
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      // HTTP instrumentation enabled with default settings
      // Custom hooks omitted due to type compatibility
      '@opentelemetry/instrumentation-http': {
        enabled: true,
      },
    }),
  ],
});

// Initialize the SDK
export function initOtel() {
  try {
    sdk.start();
    console.log('OpenTelemetry initialized successfully');
  } catch (error) {
    console.error('Error initializing OpenTelemetry', error);
  }

  // Graceful shutdown
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('OpenTelemetry terminated'))
      .catch(error => console.error('Error terminating OpenTelemetry', error))
      .finally(() => process.exit(0));
  });
}

export { sdk };
