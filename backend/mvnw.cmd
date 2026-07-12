@rem ----------------------------------------------------------------------------
@rem Licensed to the Apache Software Foundation (ASF) under one
@rem or more contributor license agreements.  See the NOTICE file
@rem distributed with this work for additional information
@rem regarding copyright ownership.  The ASF licenses this file
@rem to you under the Apache License, Version 2.0 (the
@rem "License"); you may not use this file except in compliance
@rem with the License.  You may obtain a copy of the License at
@rem
@rem    http://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing,
@rem software distributed under the License is distributed on an
@rem "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@rem KIND, either express or implied.  See the License for the
@rem specific language governing permissions and limitations
@rem under the License.
@rem ----------------------------------------------------------------------------

@rem ----------------------------------------------------------------------------
@rem Maven Start Up Batch script
@rem
@rem Required ENV vars:
@rem JAVA_HOME - location of a JDK home dir
@rem
@rem Optional ENV vars
@rem MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@rem MAVEN_BATCH_PAUSE - set to 'on' to wait for a key stroke before ending
@rem MAVEN_OPTS - parameters passed to the Java VM when running Maven
@rem     e.g. to debug Maven itself, use
@rem set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@rem MAVEN_SKIP_RC - flag to disable loading of mavenrc files
@rem ----------------------------------------------------------------------------

@rem Begin all REM blocks with @rem here to prevent them from being echoed
@echo off
@rem set title of command prompt window
title %0
@rem enable echoing by setting MAVEN_BATCH_ECHO to 'on'
@if "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%

@rem set %HOME% to equivalent of $HOME
if "%HOME%" == "" (set "HOME=%USERPROFILE%")

@rem Only use clean variables
set ERROR_CODE=

@rem Required untuk Windows XP/2000
setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.\

@rem Find the project's .mvn directory, locate the jar and properties for self-extraction.
set WRAPPER_JAR="%DIRNAME%\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

set DOWNLOAD_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"

FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%DIRNAME%\.mvn\wrapper\maven-wrapper.properties") DO (
    if "%%A" == "wrapperUrl" SET DOWNLOAD_URL="%%B"
)

@rem Extension to allow automatic downloading of the maven-wrapper.jar from Maven Central
@rem This is for users who have checked in only the wrapper-properties and plan to download the jar
if exist %WRAPPER_JAR% (
    eval
) else (
    echo Couldn't find %WRAPPER_JAR%, attempting to download it...
    echo Downloading from: %DOWNLOAD_URL%
    powershell -Command "&{"^
		"$webclient = new-object System.Net.WebClient;"^
		"if (test-path env:http_proxy) { "^
		"  $proxy = new-object System.Net.WebProxy; "^
		"  $proxy.Address = new-object System.Uri($env:http_proxy); "^
		"  $webclient.Proxy = $proxy; "^
		"}"^
		"$webclient.DownloadFile(%DOWNLOAD_URL%, %WRAPPER_JAR%);"^
	"}"
    if not exist %WRAPPER_JAR% (
        echo Failed to download %WRAPPER_JAR%
        exit /b 1
    )
)

@rem Provide a "standard" error keys
:error
set ERROR_CODE=1

@rem Find the java.exe to execute
if not "%JAVA_HOME%" == "" goto haveJavaHome

for %%i in (java.exe) do set "JAVACMD=%%~$PATH:i"
if not "%JAVACMD%" == "" goto init

echo.
echo Error: JAVA_HOME is not defined correctly.
echo   We cannot execute %JAVACMD%
echo.
goto end

:haveJavaHome
set "JAVACMD=%JAVA_HOME%\bin\java.exe"

if exist "%JAVACMD%" goto init

echo.
echo Error: JAVA_HOME is set to an invalid directory.
echo   JAVA_HOME = "%JAVA_HOME%"
echo   Please set the JAVA_HOME variable in your Environment to match the
echo   location of your Java installation.
echo.
goto end

:init

@rem Reaching here means Java is found.
@rem Execute Maven Wrapper
"%JAVACMD%" %MAVEN_OPTS% -classpath %WRAPPER_JAR% %WRAPPER_LAUNCHER% %*
if ERRORLEVEL 1 goto error
goto end

:end
@rem set local scope variables to clean environment
endlocal & set ERROR_CODE=%ERROR_CODE%

if not "%MAVEN_BATCH_PAUSE%" == "on" goto skipPause
:pause
pause
:skipPause

exit /b %ERROR_CODE%
