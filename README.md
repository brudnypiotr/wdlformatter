# wdlformatter for Visual Studio Code

Allows upgrade and format WDL files. Extension depends on WDL formatter provided by DNA Nexus and shell formatter shfmt for bash scripts formatting. 
Features:
* WDL schema version detection
* automatic WDL schema upgrades from Draft-2 to 1.0 version
* formatting WDL files (only 1.0 and higher)
* formatting bash scripts embedded into WDL files 

## Requirements

1. Download `wdlTools.jar` executable file from https://github.com/dnanexus/wdlTools/releases
2. Install `shfmt` command line tool, more info: https://github.com/mvdan/sh/blob/master/cmd/shfmt/shfmt.1.scd
3. Specify `wdlTools.jar` location  in `WDL.formatter.wdlTools.location` setting

## Extension Settings

This extension contributes the following settings:

* `WDL.formatter.wdlTools.location`: You must specify `wdlTools.jar` executable file location.
* `WDL.formatter.enable`: Enable/disable this extension.

## Known Issues

* `wdlTools.jar` formatter isn't perfect and often cannot parse specific WDLs, please report your case with problematic WDL attached
* `shfmt` cannot format bash scripts when WDL and bash are mixed in code, i.e. following code is problematic: 
```
   ~{if defined(model) then "--add_model " + model else ""}
```
* formatter has hardcoded code style formatting and currently is not customizable

## Usage

### Format with upgrade fallback if necessary

Windows: <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>L</kbd>  
MacOS: <kbd>⇧</kbd> + <kbd>⌥</kbd> + <kbd>L</kbd>  

### Upgrade

From commands editor choose: `Upgrade WDL file from Draft-2 to 1.0 version`