function Get-DPT {
    [CmdletBinding()]
    param([string]$Name = 'DartPower Team')
    "DPT ($Name)"
}

Export-ModuleMember -Function Get-DPT
