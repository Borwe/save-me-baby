![save_me_logo](https://github.com/Borwe/save-me-baby/blob/main/img/logo-no-background.png)

## What it does
This a plugin that would auto generate a commit based on previous commit, and send a push on save if the file is part of a git repo

## Requirements

- VsCode, or it's forks.
- Git in your path

## How it works
- User can activate saving mode, by using the command "save-me-baby.start-saving" or command pallete:
![save_me_mode](https://github.com/Borwe/save-me-baby/blob/main/img/start_saving.png)
- User can also toggle on, or off, by using the command "save-me-baby.toggle" or command pallete:
![toggle_save_me_mode](https://github.com/Borwe/save-me-baby/blob/main/img/toggle_saving.png)
- User can also stop saving all together with the command "save-me-baby.stop-saving" or command pallete:
![stop_save_me_mode](https://github.com/Borwe/save-me-baby/blob/main/img/stop_saving.png)
- Everytime user saves, a commit is created and pushed with same msg as previous commit
- User can also compress matching commits using the command "save-me-baby.compress" or command pallete:
![compress_save_me_mode](https://github.com/Borwe/save-me-baby/blob/main/img/compress_saving.png)

# Building from source
```sh
npm install && npm run package
```

# Testing
```sh
npm install && npm run test
```

# Contributing
- Before submitting a pullrequest please make sure tests pass. If stack post an issue.
- Issues are open.