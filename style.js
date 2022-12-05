export default function (options) {
  return `
  .echo-popover {
    width: 260px;
    padding: 20px 16px 16px;
    background-color: #fff;
    border-radius: 10px;
    border: 1px solid #F4F5FA;
    box-shadow: 0 2px 10px rgba(0, 0, 0, .08);
    display: none;
    z-index: ${options.zIndex};
  }
  
  .echo-popover[data-show] {
    display: block;
  }
  
  .echo-popover[data-popper-placement=top] .echo-popover__arrow {
    bottom: -5px;
  }
  
  .echo-popover[data-popper-placement=top] .echo-popover__arrow::before {
    border-top-color: transparent;
    border-left-color: transparent;
  }
  
  .echo-popover[data-popper-placement=bottom] .echo-popover__arrow {
    top: -5px;
  }
  
  .echo-popover[data-popper-placement=bottom] .echo-popover__arrow::before {
    border-bottom-color: transparent;
    border-right-color: transparent;
  }
  
  .echo-popover__arrow::before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    background: white;
    transform: rotate(45deg);
    border: 1px solid #F4F5FA;
  }
  
  .echo-has-liked .echo-like {
    color: #4E75F6;
  }
  
  .echo-has-liked .echo-like__icon {
    fill: #4E75F6;
  }
  
  .echo-like {
    display: inline-flex;
    align-items: center;
    font-size: 14px;
    color: #16171C;
    cursor: pointer;
    transition: all .3s ease;
  }
  
  .echo-like:hover {
    color: #4E75F6;
  }
  
  .echo-like:hover .echo-like__icon {
    fill: #4E75F6;
  }
  
  .echo-like__icon {
    fill: #4C505D;
    transition: all .3s ease;
  }
  
  .echo-like__icon + .echo-like__count {
    margin-left: 6px;
  }
  
  .echo-popover__power {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    min-height: 36px;
    padding: 6px 10px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    background: repeating-linear-gradient(135deg, rgba(255,170,2,.1), rgba(255,170,2,.1) 4px, transparent 0, transparent 10px);
    color: #16171C;
  }
  
  .echo-popover__power-label {
    margin: 0 5px;
  }
  
  .echo-popover__liker-list {
    display: none;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }
  
  .echo-popover__liker-item {
    display: flex;
  }
  
  .echo-popover__liker-item:nth-child(1) {
    z-index: 9;
  }

  .echo-popover__liker-item:nth-child(2) {
    z-index: 8;
  }

  .echo-popover__liker-item:nth-child(3) {
    z-index: 7;
  }

  .echo-popover__liker-item:nth-child(4) {
    z-index: 6;
  }

  .echo-popover__liker-item:nth-child(5) {
    z-index: 5;
  }
  
  .echo-popover__liker-image {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: white;
    border: 1px solid #efefef;
    box-shadow: white 0px 0px 0px 2px;
    object-fit: cover;
    overflow: hidden;
  }
  
  .echo-popover__liker-more {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 6px;
    border-radius: 12px;
    font-size: 12px;
    color: #4C505D;
    background: #F4F5FA;
    box-shadow: rgb(255 255 255) 0px 0px 0px 2px;
  }
  
  .echo-popover__bottom {
    display: flex;
    align: center;
    justify-content: space-between;
    margin-top: 16px;
  }
  
  .echo-popover__partner {
    font-size: 12px;
    color: #929AB2;
  }
  
  .echo-popover__homelink {
    font-size: 12px;
    color: #929AB2;
    transition: all .3s ease;
  }
  
  .echo-popover__homelink:hover {
    color: #4E75F6;
  }
  
  .echo-popover__connect {
    margin-left: 10px;
    font-size: 12px;
    color: #929AB2;
    cursor: pointer;
    transition: all .3s ease;
  }
  
  .echo-popover__connect:hover {
    color: #4E75F6;
  }
  
  .echo-popover__logout {
    width: 86px;
    margin-left: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    cursor: pointer;
  }
  
  .echo-popover__logout:hover .echo-popover__login-info {
    color: #4E75F6;
  }
  
  .echo-popover__logout:hover .echo-popover__logout-icon {
    fill: #4E75F6;
  }
  
  .echo-popover__login-info {
    margin-right: 5px;
    font-size: 12px;
    text-align: right;
    color: #929AB2;
    transition: all .3s ease;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  
  .echo-popover__logout-icon {
    flex-shrink: 0;
    transition: all .3s ease;
  }
  
  #echo-message {
    position: fixed;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 12px;
    background: white;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, .12);
    font-weight: 600;
    display: none;
  }
  
  #echo-message.echo-error {
    color: #FF4838;
  }
  
  #echo-message.echo-success {
    color: #83BF1C;
  }
  
  #echo-loading {
    display: none;
    position: fixed;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 12px;
    background: white;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, .12);
  }
  
  .echo-loading__loader {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #4E75F6;
    clip-path: inset(0 0 50% 0);
    transform: rotate(0);
    animation: spin .6s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .echo-theme-dark .echo-like {
    color: rgba(255, 255, 255, .8);
  }
  
  .echo-theme-dark .echo-like__icon {
    fill: rgba(255, 255, 255, .8);
  }
  
  .echo-theme-dark .echo-like:hover,
  .echo-theme-dark.echo-has-liked .echo-like {
    color: #4E75F6;
  }
  
  .echo-theme-dark .echo-like:hover .echo-like__icon,
  .echo-theme-dark.echo-has-liked .echo-like__icon {
    fill: #4E75F6;
  }
  
  .echo-theme-dark.echo-popover {
    background: #0d0f17;
  }
  
  .echo-theme-dark .echo-popover__arrow::before {
    background: #0d0f17;
  }
  
  .echo-theme-dark .echo-popover__liker-image {
    box-shadow: rgba(255, 255, 255, .3) 0px 0px 0px 2px;
  }
  
  .echo-theme-dark .echo-popover__power {
    color: white;
    background: repeating-linear-gradient(135deg, rgba(255, 255, 255, .1), rgba(255, 255, 255, .1) 4px, transparent 0, transparent 10px);
  }
  `
}