# WDL Formatter for Visual Studio Code

The **WDL Formatter** extension for Visual Studio Code provides powerful tools for upgrading and formatting WDL (Workflow Description Language) files seamlessly within your development environment. It leverages the capabilities of DNAnexus wdlTools and Cromwell womtool to enhance your WDL editing experience.

## Features

- **Automatic Schema Version Detection:** Automatically detects the schema version of your WDL files.
- **Schema Upgrades:** Seamlessly upgrades WDL files from Draft-2 to version 1.0.
- **Precise Formatting:** Formats WDL files with precision, ensuring consistency and readability.
- **Embedded Bash Script Formatting:** Formats bash scripts embedded within WDL files for improved clarity.
- **Type-Checking with wdlTools:** Identifies type errors in WDL files using DNAnexus wdlTools.
- **Type-Checking with womtool:** Checks WDL files for type errors using Cromwell womtool.
- **Draft-2 Compatibility Fixer:** Corrects Draft-2 issues, ensuring compatibility with DNAnexus wdlTools.

## Requirements

Before using the extension, ensure the following:

- **Download Executable Files:**
  - Obtain `wdlTools.jar` from [here](https://github.com/dnanexus/wdlTools/releases).
  - Get `womtool.jar` from [here](https://github.com/broadinstitute/cromwell/releases).
  - Acquire `fixer.rb` from the extension's bin folder.
- **Install `shfmt`:**
  - Install the `shfmt` command line tool. Instructions are available [here](https://github.com/mvdan/sh/blob/master/cmd/shfmt/shfmt.1.scd).
- **Specify File Locations:**
  - Set the location of `wdlTools.jar` in the `WDL.formatter.wdlTools.location` setting.
  - Set the location of `womtool.jar` in the `WDL.formatter.womTools.location` setting.
  - Specify the location of `fixer.rb` in the `WDL.formatter.fix.rubyRb.location` setting.

## Extension Settings

This extension contributes the following settings:

- **WDL Formatter Settings:**
  - `WDL.formatter.wdlTools.location`: Specifies the location of `wdlTools.jar`.
  - `WDL.formatter.womTools.location`: Specifies the location of `womtool.jar`.
  - `WDL.formatter.fix.rubyRb.location`: Specifies the location of `fixer.rb`.
  - `WDL.formatter.enable`: Enables or disables the extension.

## Known Issues

- **Parsing Limitations:** The `wdlTools.jar` formatter may not parse certain WDL files perfectly. If you encounter such cases, please report them along with the problematic files for further investigation.
- **Formatting Challenges:** `shfmt` may face difficulties when formatting bash scripts mixed with WDL code.
- **Customization Limitations:** The formatter's code style formatting is currently hardcoded and not customizable.

## Usage

### Format with Upgrade Fallback

- **Windows:** Press <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>L</kbd>
- **MacOS:** Press <kbd>⇧</kbd> + <kbd>⌥</kbd> + <kbd>L</kbd>

### Upgrade Commands

- **Upgrade WDL File:** Upgrades a WDL file from Draft-2 to version 1.0.
- **Fix Draft-2 Issues:** Fixes Draft-2 issues in a WDL file using the Ruby fixer, ensuring compatibility with wdlTools.
- **Type-Check with wdlTools:** Performs type-checking on a WDL file using DNAnexus wdlTools.
- **Type-Check with womtool:** Conducts type-checking on a WDL file using Cromwell womtool.

## Feedback

Your feedback is invaluable in improving the extension. If you encounter any issues or have suggestions for enhancements, please don't hesitate to [open an issue](https://github.com/brudnypiotr/wdlformatter/issues) on GitHub.

## License

This extension is licensed under the [MIT License](LICENSE). Feel free to contribute or modify according to your requirements.

---

**Enjoy seamless WDL file management with the WDL Formatter extension for Visual Studio Code!**