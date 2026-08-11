using System;
using System.Diagnostics;
using System.IO;
using System.Security.Principal;
using Microsoft.Win32;

internal static class Program
{
    private static void KillProcess(string name)
    {
        foreach (Process process in Process.GetProcessesByName(name))
        {
            try
            {
                process.Kill();
                process.WaitForExit(3000);
            }
            catch
            {
                // process may already be gone
            }
        }
    }

    private static void DeleteFile(string path)
    {
        try
        {
            if (File.Exists(path))
            {
                File.Delete(path);
            }
        }
        catch
        {
            // ignore locked or missing files
        }
    }

    private static void DeleteRegistryKey(string path)
    {
        try
        {
            Registry.LocalMachine.DeleteSubKeyTree(path, false);
        }
        catch
        {
            // ignore missing keys
        }
    }

    private static bool IsAdministrator()
    {
        WindowsIdentity identity = WindowsIdentity.GetCurrent();
        WindowsPrincipal principal = new WindowsPrincipal(identity);
        return principal.IsInRole(WindowsBuiltInRole.Administrator);
    }

    private static int Main()
    {
        if (!IsAdministrator())
        {
            ProcessStartInfo startInfo = new ProcessStartInfo
            {
                FileName = Process.GetCurrentProcess().MainModule.FileName,
                UseShellExecute = true,
                Verb = "runas",
            };

            try
            {
                Process.Start(startInfo);
                return 0;
            }
            catch
            {
                Console.WriteLine("需要管理员权限才能卸载。");
                return 1;
            }
        }

        KillProcess("Imagine-1MB");
        KillProcess("Imagine");

        DeleteFile(@"C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Imagine-1MB.lnk");
        DeleteFile(@"C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Imagine.lnk");

        DeleteRegistryKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Imagine-1MB");
        DeleteRegistryKey(@"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\Imagine-1MB");
        DeleteRegistryKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\09dc0688-32e9-521b-a09a-61be9f591552");

        string installDir = Path.GetDirectoryName(Process.GetCurrentProcess().MainModule.FileName);
        string tempBat = Path.Combine(
            Path.GetTempPath(),
            "remove-imagine-1mb-" + Guid.NewGuid().ToString("N") + ".bat"
        );
        string batch =
            "@echo off\r\n" +
            "timeout /t 2 /nobreak >nul\r\n" +
            "rd /s /q \"" + installDir + "\"\r\n" +
            "del /f /q \"" + tempBat + "\"\r\n";

        try
        {
            File.WriteAllText(tempBat, batch);
            ProcessStartInfo batchInfo = new ProcessStartInfo
            {
                FileName = tempBat,
                UseShellExecute = true,
                WindowStyle = ProcessWindowStyle.Hidden,
            };
            Process.Start(batchInfo);
        }
        catch
        {
            // if self-cleanup fails, the folder can be removed manually
        }

        return 0;
    }
}
