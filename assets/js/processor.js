class Processor extends AudioWorkletProcessor {
  process([input], [output]) {
    // Copy inputs to outputs.
    output[0].set(input[0]);
    return true;
  }
}

registerProcessor("processor", Processor);
