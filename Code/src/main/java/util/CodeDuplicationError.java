package util;

public class CodeDuplicationError extends Error {

  private static final long serialVersionUID = 1L;

  public CodeDuplicationError() {
    super();
  }

  public CodeDuplicationError(String message, Throwable cause, boolean enableSuppression,
      boolean writableStackTrace) {
    super(message, cause, enableSuppression, writableStackTrace);
  }

  public CodeDuplicationError(String message, Throwable cause) {
    super(message, cause);
  }

  public CodeDuplicationError(String message) {
    super(message);
  }

  public CodeDuplicationError(Throwable cause) {
    super(cause);
  }

}
